import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_DOSSIER_ORIGINAL_TABLE_ID = process.env.AIRTABLE_DOSSIER_ORIGINAL_TABLE_ID ?? "Dossier original"

type AirtableFieldMeta = { name: string; type: string }
type AirtableTableMeta = { id: string; name: string; fields?: AirtableFieldMeta[] }

function stringifyAirtableValue(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    const list = value
      .map((v) => stringifyAirtableValue(v))
      .filter((v) => v.length > 0)
    return list.join(", ")
  }
  if (typeof value === "object") {
    const rec = value as Record<string, unknown>
    if (typeof rec.name === "string") return rec.name.trim()
    if (typeof rec.filename === "string") return rec.filename.trim()
    if (typeof rec.value === "string") return rec.value.trim()
  }
  return String(value).trim()
}

function getFieldValue(fields: Record<string, unknown>, candidates: string[]): string {
  const keys = Object.keys(fields)
  for (const name of candidates) {
    const direct = fields[name]
    const directValue = stringifyAirtableValue(direct)
    if (directValue) return directValue

    const key = keys.find((k) => k.toLowerCase() === name.toLowerCase())
    if (!key) continue
    const value = stringifyAirtableValue(fields[key])
    if (value) return value
  }
  return ""
}

function getStatutDossierValue(fields: Record<string, unknown>): string {
  const direct = getFieldValue(fields, [
    "Statut de dossier",
    "statut de dossier",
    "Statut du dossier",
    "statut du dossier",
    "Statut dossier",
    "statut dossier",
    "Dossier status",
    "dossier status",
    "Status dossier",
    "status dossier",
    "Status",
    "status",
  ])
  if (direct) return direct

  // Fallback: any field name containing both words "statut/status" and "dossier"
  const dynamicKey = Object.keys(fields).find((k) => {
    const n = k.toLowerCase()
    const hasStatusWord = n.includes("statut") || n.includes("status")
    const hasDossierWord = n.includes("dossier")
    return hasStatusWord && hasDossierWord
  })

  if (!dynamicKey) return ""
  return stringifyAirtableValue(fields[dynamicKey])
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prospectId = typeof body.prospectId === "string" ? body.prospectId.trim() : ""

    if (!prospectId) {
      return NextResponse.json({ error: "Prospect ID requis" }, { status: 400 })
    }
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: "Configuration Airtable manquante" }, { status: 500 })
    }

    const schemaRes = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
    })
    if (!schemaRes.ok) {
      return NextResponse.json({ error: "Impossible de lire le schéma Airtable" }, { status: 502 })
    }

    const schemaData = await schemaRes.json()
    const tables: AirtableTableMeta[] = schemaData.tables ?? []
    const dossierTable = tables.find(
      (t) =>
        t.id === AIRTABLE_DOSSIER_ORIGINAL_TABLE_ID ||
        t.name === AIRTABLE_DOSSIER_ORIGINAL_TABLE_ID ||
        t.name?.toLowerCase() === AIRTABLE_DOSSIER_ORIGINAL_TABLE_ID.toLowerCase(),
    )

    if (!dossierTable?.id) {
      return NextResponse.json({ success: true, dossierOriginal: null, message: "Table Dossier original introuvable." })
    }

    const tableFields = dossierTable.fields ?? []
    const prospectField = tableFields.find(
      (f) => f.name === "Prospect ID" || f.name.toLowerCase() === "prospect id",
    )
    if (!prospectField) {
      return NextResponse.json(
        { success: true, dossierOriginal: null, message: "Champ 'Prospect ID' introuvable dans Dossier original." },
      )
    }

    const safeId = prospectId.replace(/"/g, '\\"')
    const filterFormula = `{${prospectField.name}} = "${safeId}"`

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(dossierTable.id)}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err || "Échec lecture Dossier original" }, { status: 502 })
    }

    const data = await res.json()
    const fields = (data.records?.[0]?.fields ?? {}) as Record<string, unknown>
    if (!data.records?.length) {
      return NextResponse.json({ success: true, dossierOriginal: null })
    }

    const dossierOriginal = {
      requiredDocuments: getFieldValue(fields, [
        "Required documents",
        "required documents",
        "Required Documents",
        "Documents requis",
      ]),
      commentaire: getFieldValue(fields, ["Commentaire", "commentaire", "Comment", "comment", "Comments"]),
      evaluationDossier: getFieldValue(fields, [
        "Evaluation dossier",
        "evaluation dossier",
        "Evaluation Dossier",
        "Évaluation dossier",
      ]),
      statutDossier: getStatutDossierValue(fields),
    }

    return NextResponse.json({ success: true, dossierOriginal })
  } catch (error) {
    console.error("POST /api/dossier-original:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
