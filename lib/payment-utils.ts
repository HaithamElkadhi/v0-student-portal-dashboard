import type { Payment, PaymentStatus } from "./payment-types"

const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."] as const

export function statusToFrench(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "Payé"
    case "due":
      return "À payer"
    case "exempt":
      return "Exonéré"
    case "overdue":
      return "En retard"
    default:
      return status
  }
}

export function parseDueDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Jours jusqu’à l’échéance (négatif si dépassée) */
export function daysUntilDue(iso: string): number {
  const due = parseDueDate(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

export function isDueWithinDays(p: Payment, days: number): boolean {
  if (p.status !== "due") return false
  const d = daysUntilDue(p.dueDate)
  return d > 0 && d <= days
}

export function getUrgentDuePayment(payments: Payment[]): Payment | null {
  return payments.find((p) => isDueWithinDays(p, 7)) ?? null
}

export function formatDueDateLabel(iso: string): string {
  const d = parseDueDate(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mo = MONTHS_FR[d.getMonth()]
  const yy = d.getFullYear()
  return `${dd} ${mo} ${yy}`
}

export function formatMoney(amount: number, currency: string): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount) +
    (currency ? " " + currency : "")
  )
}

export function formatAmountFr(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export type PaymentSummaryTone = "danger" | "warning" | "success" | "muted"

export interface PaymentSummaryLine {
  tone: PaymentSummaryTone
  text: string
}

/** Résumé court pour le tableau de bord (carte Paiement). */
export function getPaymentDashboardSummaryLines(payments: Payment[]): PaymentSummaryLine[] {
  const lines: PaymentSummaryLine[] = []
  if (payments.length === 0) {
    return [{ tone: "muted", text: "Aucune ligne de paiement pour ce dossier." }]
  }

  const overdue = payments.filter((p) => p.status === "overdue")
  const due = payments.filter((p) => p.status === "due")
  const paid = payments.filter((p) => p.status === "paid")
  const exempt = payments.filter((p) => p.status === "exempt")

  if (overdue.length > 0) {
    lines.push({
      tone: "danger",
      text:
        overdue.length === 1
          ? `Paiement en retard : ${overdue[0].ref} — ${formatMoney(overdue[0].amount, overdue[0].currency)} (échéance ${formatDueDateLabel(overdue[0].dueDate)}).`
          : `${overdue.length} paiement(s) en retard — ouvrez la page pour le détail.`,
    })
  }

  const urgent = getUrgentDuePayment(payments)

  if (due.length > 0) {
    if (due.length === 1) {
      const p = due[0]
      const j = daysUntilDue(p.dueDate)
      const soon = j >= 0 && j <= 7 ? ` · dans ${j} jour(s)` : ""
      lines.push({
        tone: "warning",
        text: `Facture / paiement à régler : ${p.ref} — ${formatMoney(p.amount, p.currency)} · échéance ${formatDueDateLabel(p.dueDate)}${soon}.`,
      })
    } else {
      let t = `${due.length} paiement(s) encore à régler.`
      if (urgent) {
        const j = daysUntilDue(urgent.dueDate)
        t += ` Le plus urgent : ${urgent.ref} (${j} jour(s)).`
      }
      lines.push({ tone: "warning", text: t })
    }
  }

  if (overdue.length === 0 && due.length === 0) {
    lines.push({
      tone: "success",
      text: "Aucun impayé — rien à régler pour l’instant.",
    })
  }

  const meta: string[] = []
  if (paid.length > 0) meta.push(`${paid.length} réglé${paid.length > 1 ? "s" : ""}`)
  if (exempt.length > 0) meta.push(`${exempt.length} exonéré${exempt.length > 1 ? "s" : ""}`)
  if (meta.length > 0) {
    lines.push({ tone: "muted", text: meta.join(" · ") + "." })
  }

  return lines
}
