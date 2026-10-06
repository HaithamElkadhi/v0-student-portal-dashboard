import type { Payment, PaymentStatus } from "./payment-types"

/** Noms de champs possibles (ordre de priorité) — alignez sur votre base Airtable */
const ALIASES = {
  ref: ["Réf", "Ref", "Reference", "N° paiement", "ID"],
  amount: ["Montant", "Amount", "Montant TTC"],
  currency: ["Devise", "Currency"],
  motif: ["Purpose", "Motif", "Description", "Libellé", "Objet", "Libelle"],
  status: ["Statut", "Status", "État"],
  dueDate: ["Échéance", "Echeance", "Date d'échéance", "Due date", "Date echeance"],
  paymentDate: ["Date de paiement", "Payment date", "Date paiement"],
  comment: ["Commentaire", "Notes", "Note", "Comment"],
  exemptReason: ["Motif exonération", "Motif exoneration", "Exemption reason", "Raison exonération"],
  /** Unique champ facture dans la base (texte ou pièce jointe) */
  invoice: ["Invoice", "Facture"],
  /** Champ type « last modified time » dans Airtable */
  lastModifiedAt: [
    "Last modification",
    "Dernière modification",
    "Derniere modification",
    "Last modified",
    "Last Modified",
    "Modified",
  ],
} as const

function pickField(fields: Record<string, unknown>, candidates: readonly string[]): unknown {
  const keys = Object.keys(fields)
  for (const c of candidates) {
    if (fields[c] !== undefined && fields[c] !== null && fields[c] !== "") {
      return fields[c]
    }
  }
  const lower = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  for (const c of candidates) {
    const found = keys.find((k) => lower(k) === lower(c))
    if (found && fields[found] !== undefined && fields[found] !== null && fields[found] !== "") {
      return fields[found]
    }
  }
  return undefined
}

function toNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/\s/g, "").replace(",", "."))
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function toText(v: unknown): string {
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join(" · ")
  if (typeof v === "string") return v.trim()
  if (typeof v === "number" && !Number.isNaN(v)) return String(v)
  if (v && typeof v === "object" && "name" in (v as Record<string, unknown>)) {
    const n = (v as { name?: unknown }).name
    if (typeof n === "string") return n.trim()
  }
  return ""
}

/** Pièces jointes Airtable : [{ url, filename, ... }] */
function normalizeInvoiceField(value: unknown): { label?: string; url?: string } {
  if (value === undefined || value === null || value === "") return {}

  const fromAttachment = (item: unknown): { label?: string; url?: string } | null => {
    if (!item || typeof item !== "object") return null
    const o = item as { url?: unknown; filename?: unknown }
    if (typeof o.url !== "string" || !o.url.trim()) return null
    const filename = typeof o.filename === "string" ? o.filename.trim() : ""
    return { url: o.url.trim(), label: filename || "Facture" }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = fromAttachment(item)
      if (parsed?.url) return parsed
    }
    return {}
  }

  const single = fromAttachment(value)
  if (single?.url) return single

  if (typeof value === "string") {
    const s = value.trim()
    if (/^https:\/\//i.test(s)) return { url: s, label: "Facture.pdf" }
    if (s) return { label: s }
    return {}
  }

  if (typeof value === "number" && !Number.isNaN(value)) {
    return { label: String(value) }
  }

  return {}
}

function toIsoDate(v: unknown): string {
  if (typeof v === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10)
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

/** Date-heure ISO pour champs lastModifiedTime / createdTime Airtable */
function toIsoDateTime(v: unknown): string | undefined {
  if (typeof v !== "string" || !v.trim()) return undefined
  const d = new Date(v.trim())
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

/** Texte normalisé pour comparer statuts (évite que « paye » dans « payer » déclenche Payé). */
function normalizeStatusText(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function mapAirtableStatus(raw: unknown): PaymentStatus {
  const s = normalizeStatusText(raw)
  if (!s) return "due"

  // D'abord les variantes "à payer"/impayé, pour éviter la collision paye/payer.
  if (
    s.includes("a payer") ||
    s === "due" ||
    s === "unpaid" ||
    s.includes("non paye") ||
    s.includes("non-paye") ||
    s.includes("impaye") ||
    s.includes("en attente")
  ) {
    return "due"
  }

  // Evite les faux positifs type "non exonere"
  if (/non\s*-?\s*exonere/.test(s)) return "due"

  // Exonération uniquement sur mots complets
  if (/\bexonere\b|\bexoneree\b|\bexempt\b/u.test(s)) return "exempt"
  if (s.includes("retard") || s.includes("overdue") || s.includes("en retard")) return "overdue"
  if (s === "paid" || /\bpaye\b/u.test(s)) return "paid"
  return "due"
}

export function mapAirtableRecordToPayment(record: {
  id: string
  createdTime?: string
  fields: Record<string, unknown>
}): Payment | null {
  const { id, fields } = record
  const createdTime = toIsoDateTime(record.createdTime)
  const lastModifiedFromField = toIsoDateTime(pickField(fields, ALIASES.lastModifiedAt))
  const lastModifiedAt = lastModifiedFromField ?? createdTime
  const refRaw = pickField(fields, ALIASES.ref)
  const ref = String(refRaw ?? id).trim() || id

  const amount = toNumber(pickField(fields, ALIASES.amount))
  const currencyRaw = pickField(fields, ALIASES.currency)
  const currency = toText(currencyRaw) || "EUR"

  const motif = toText(pickField(fields, ALIASES.motif)) || "—"
  const status = mapAirtableStatus(toText(pickField(fields, ALIASES.status)))
  const dueDate = toIsoDate(pickField(fields, ALIASES.dueDate))
  const paymentDateRaw = pickField(fields, ALIASES.paymentDate)
  const paymentDate = paymentDateRaw ? toIsoDate(paymentDateRaw) : undefined
  const comment = String(pickField(fields, ALIASES.comment) ?? "").trim()
  const exemptReason = String(pickField(fields, ALIASES.exemptReason) ?? "").trim() || undefined
  const inv = pickField(fields, ALIASES.invoice)
  const { label: invoiceLabel, url: invoiceUrl } = normalizeInvoiceField(inv)
  const invoiceRef = invoiceLabel

  return {
    ref,
    amount,
    currency,
    motif,
    status,
    dueDate,
    comment,
    paymentDate,
    exemptReason,
    invoiceRef,
    invoiceUrl,
    createdTime,
    lastModifiedAt,
  }
}
