import type { Payment, PaymentStatus, TimelineEvent } from "./payment-types"

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

export function formatFrDateTime(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()

  const dd = String(d.getDate()).padStart(2, "0")
  const mo = MONTHS_FR[d.getMonth()]
  const yy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  const datePart = `${dd} ${mo} ${yy}`
  if (sameDay) {
    return `Auj. ${datePart} ${hh}:${mm}`
  }
  return `${datePart} ${hh}:${mm}`
}

export function sortTimelineDesc(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
