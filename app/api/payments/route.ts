import { NextRequest, NextResponse } from "next/server"
import type { Payment, TimelineEvent } from "@/lib/payment-types"
import { mapAirtableRecordToPayment } from "@/lib/map-airtable-payment"
import {
  escapeAirtableFormulaString,
  listFieldNamesForError,
  resolveEmailMatchField,
  resolveProspectField,
  type AirtableFieldMeta,
} from "@/lib/airtable-payments-query"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_PAYMENTS_TABLE_ID = process.env.AIRTABLE_PAYMENTS_TABLE_ID

/** Table contenant les dossiers (pour résoudre record id si Paiements lie vers Prospects) */
const PROSPECTS_TABLE_REF = process.env.AIRTABLE_PROSPECTS_TABLE_ID ?? "Prospects"

/** Nom du champ sur cette table pour l’ID dossier (login) */
const PROSPECT_ID_FIELD_ON_LEADS = process.env.AIRTABLE_PAYMENT_PROSPECT_ID_LOOKUP ?? "Prospect ID"

/**
 * Champ dans Paiements utilisé pour le filtre (nom exact Airtable).
 * Ex. lien « Prospect », ou lookup « Email » / « Prospect ID (from Prospects) ».
 */
const PAYMENT_FILTER_FIELD_ENV = process.env.AIRTABLE_PAYMENT_PROSPECT_FIELD

/**
 * prospectId = comparer au dossier (ID prospect / folder) — défaut
 * email      = comparer à l’email (champ texte ou lookup email dans Paiements)
 */
const MATCH_BY = (process.env.AIRTABLE_PAYMENT_MATCH_BY ?? "prospectId").toLowerCase()

type TableMeta = {
  id: string
  name: string
  fields?: AirtableFieldMeta[]
}

function isTextLike(type: string) {
  return (
    type === "singleLineText" ||
    type === "multilineText" ||
    type === "email" ||
    type === "phoneNumber" ||
    type === "url" ||
    type === "singleSelect" ||
    type === "multipleSelects" ||
    type === "formula" ||
    type === "rollup" ||
    type === "multipleLookupValues"
  )
}

function isLink(type: string) {
  return type === "multipleRecordLinks" || type === "singleRecordLink"
}

function toIsoAtHour(dateIso: string, hour: number): string {
  const [y, m, d] = dateIso.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d, hour, 0, 0, 0).toISOString()
}

function shiftIsoDays(dateIso: string, days: number, hour: number): string {
  const [y, m, d] = dateIso.slice(0, 10).split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString()
}

function daysUntil(dateIso: string): number {
  const [y, m, d] = dateIso.slice(0, 10).split("-").map(Number)
  const due = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

function mentionsInvoiceUpdate(comment: string): boolean {
  const s = comment
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  return s.includes("modifi") || s.includes("corrig") || s.includes("mis a jour")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prospectId = typeof body.prospectId === "string" ? body.prospectId.trim() : ""
    const emailRaw = typeof body.email === "string" ? body.email.trim() : ""

    const matchByEmail = MATCH_BY === "email"

    if (matchByEmail) {
      if (!emailRaw) {
        return NextResponse.json(
          { error: "Email requis pour le filtre par email (AIRTABLE_PAYMENT_MATCH_BY=email)" },
          { status: 400 },
        )
      }
    } else {
      if (!prospectId) {
        return NextResponse.json({ error: "Prospect ID requis" }, { status: 400 })
      }
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_PAYMENTS_TABLE_ID) {
      console.error("Missing Airtable env for payments", {
        hasApiKey: !!AIRTABLE_API_KEY,
        hasBaseId: !!AIRTABLE_BASE_ID,
        hasPaymentsTable: !!AIRTABLE_PAYMENTS_TABLE_ID,
      })
      return NextResponse.json(
        { error: "Configuration serveur : variables Airtable paiements manquantes" },
        { status: 500 },
      )
    }

    const schemaUrl = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`
    const schemaRes = await fetch(schemaUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!schemaRes.ok) {
      return NextResponse.json({ error: "Impossible de lire le schéma Airtable" }, { status: 502 })
    }

    const schemaData = await schemaRes.json()
    const tables: TableMeta[] = schemaData.tables ?? []

    const paymentsTable = tables.find(
      (table) =>
        table.name?.toLowerCase() === AIRTABLE_PAYMENTS_TABLE_ID?.toLowerCase() ||
        table.id === AIRTABLE_PAYMENTS_TABLE_ID ||
        table.name === AIRTABLE_PAYMENTS_TABLE_ID,
    )

    if (!paymentsTable?.id) {
      return NextResponse.json({
        success: true,
        payments: [] as Payment[],
        timeline: [] as TimelineEvent[],
        message: `Table « ${AIRTABLE_PAYMENTS_TABLE_ID} » introuvable dans la base.`,
      })
    }

    const paymentFields: AirtableFieldMeta[] = paymentsTable.fields ?? []

    let filterFormula: string

    if (matchByEmail) {
      const emailField = resolveEmailMatchField(paymentFields, PAYMENT_FILTER_FIELD_ENV)
      if (!emailField) {
        return NextResponse.json(
          {
            error:
              "Champ email introuvable dans Paiements. Ajoutez un lookup « Email » depuis Prospects, ou définissez AIRTABLE_PAYMENT_PROSPECT_FIELD avec le nom exact du champ.",
            champsDisponibles: listFieldNamesForError(paymentFields),
          },
          { status: 500 },
        )
      }
      if (!isTextLike(emailField.type)) {
        return NextResponse.json(
          {
            error: `Le champ « ${emailField.name} » n’est pas utilisable pour un filtre texte (type: ${emailField.type}).`,
          },
          { status: 500 },
        )
      }
      const emailNorm = emailRaw.toLowerCase()
      filterFormula = `LOWER({${emailField.name}}) = "${escapeAirtableFormulaString(emailNorm)}"`
    } else {
      const prospectField = resolveProspectField(paymentFields, PAYMENT_FILTER_FIELD_ENV)

      if (!prospectField) {
        return NextResponse.json(
          {
            error:
              "Aucun champ dossier détecté dans la table Paiements. Définissez AIRTABLE_PAYMENT_PROSPECT_FIELD (ex. « Prospect » pour le lien, ou un lookup Prospect ID).",
            champsDisponibles: listFieldNamesForError(paymentFields),
          },
          { status: 500 },
        )
      }

      if (isTextLike(prospectField.type)) {
        filterFormula = `{${prospectField.name}} = "${escapeAirtableFormulaString(prospectId)}"`
      } else if (isLink(prospectField.type)) {
        const prospectsTable = tables.find(
          (t) =>
            t.id === PROSPECTS_TABLE_REF ||
            t.name === PROSPECTS_TABLE_REF ||
            t.name?.toLowerCase() === PROSPECTS_TABLE_REF.toLowerCase(),
        )
        if (!prospectsTable?.id) {
          return NextResponse.json(
            {
              error:
                "Table dossiers introuvable (variable AIRTABLE_PROSPECTS_TABLE_ID). Nécessaire pour filtrer via le lien Prospect.",
            },
            { status: 500 },
          )
        }

        const prospectFilter = `{${PROSPECT_ID_FIELD_ON_LEADS}} = "${escapeAirtableFormulaString(prospectId)}"`
        const prospectUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(prospectsTable.id)}?filterByFormula=${encodeURIComponent(prospectFilter)}&maxRecords=1`

        const prospectRes = await fetch(prospectUrl, {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        })

        if (!prospectRes.ok) {
          return NextResponse.json({ error: "Échec recherche du prospect dans la table dossiers" }, { status: 502 })
        }

        const prospectData = await prospectRes.json()
        const recId: string | undefined = prospectData.records?.[0]?.id
        if (!recId) {
          return NextResponse.json({ success: true, payments: [] as Payment[], timeline: [] as TimelineEvent[] })
        }

        const fname = prospectField.name
        if (prospectField.type === "multipleRecordLinks") {
          filterFormula = `FIND("${recId}", ARRAYJOIN({${fname}}))`
        } else {
          filterFormula = `{${fname}} = "${recId}"`
        }
      } else {
        return NextResponse.json(
          {
            error: `Type de champ non géré pour le filtre dossier : ${prospectField.type}.`,
            champUtilisé: prospectField.name,
          },
          { status: 500 },
        )
      }
    }

    const encodedTable = encodeURIComponent(paymentsTable.id)
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedTable}?filterByFormula=${encodeURIComponent(filterFormula)}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errText = await response.text()
      let message = "Échec lecture Airtable (paiements)"
      try {
        const j = JSON.parse(errText)
        message = j.error?.message || j.message || message
      } catch {
        message = errText || message
      }
      console.error("Airtable payments error:", response.status, message, { filterFormula })
      return NextResponse.json(
        {
          error: message,
          hint:
            "Vérifiez le nom du champ (lien « Prospect », ou lookup). Voir AIRTABLE_PAYMENT_MATCH_BY=email pour filtrer par email.",
        },
        { status: response.status >= 500 ? 502 : response.status },
      )
    }

    const data = await response.json()
    const records = data.records ?? []

    const payments: Payment[] = []
    for (const rec of records) {
      const mapped = mapAirtableRecordToPayment(rec)
      if (mapped) payments.push(mapped)
    }

    const timeline: TimelineEvent[] = []
    for (const p of payments) {
      if (p.invoiceRef) {
        timeline.push({
          id: `${p.ref}-invoice-added`,
          date: toIsoAtHour(p.dueDate, 9),
          type: "invoice_added",
          paymentRef: p.ref,
          invoiceRef: p.invoiceRef,
        })
      }

      if (p.invoiceRef && p.comment && mentionsInvoiceUpdate(p.comment)) {
        timeline.push({
          id: `${p.ref}-invoice-modified`,
          date: toIsoAtHour(p.dueDate, 14),
          type: "invoice_modified",
          paymentRef: p.ref,
          invoiceRef: p.invoiceRef,
          reason: p.comment,
        })
      }

      if (p.status === "due" && !p.paymentDate) {
        const left = daysUntil(p.dueDate)
        if (left >= 0 && left <= 7) {
          timeline.push({
            id: `${p.ref}-reminder-j7`,
            date: shiftIsoDays(p.dueDate, -7, 8),
            type: "reminder",
            paymentRef: p.ref,
            daysLeft: 7,
          })
          if (left <= 3) {
            timeline.push({
              id: `${p.ref}-reminder-j3`,
              date: shiftIsoDays(p.dueDate, -3, 8),
              type: "reminder",
              paymentRef: p.ref,
              daysLeft: 3,
            })
          }
        }
      }

      if (p.status === "paid" && p.paymentDate) {
        timeline.push({
          id: `${p.ref}-received`,
          date: toIsoAtHour(p.paymentDate, 9),
          type: "payment_received",
          paymentRef: p.ref,
          transferRef: p.transferRef,
        })
      }

      if (p.status === "overdue") {
        timeline.push({
          id: `${p.ref}-overdue`,
          date: shiftIsoDays(p.dueDate, 1, 8),
          type: "overdue_alert",
          paymentRef: p.ref,
        })
      }

      if (p.status === "exempt") {
        timeline.push({
          id: `${p.ref}-exempt`,
          date: toIsoAtHour(p.dueDate, 10),
          type: "exemption_granted",
          paymentRef: p.ref,
          reason: p.exemptReason,
        })
      }
    }

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      payments,
      timeline,
    })
  } catch (e) {
    console.error("POST /api/payments:", e)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}