export type PaymentStatus = "paid" | "due" | "exempt" | "overdue"

export interface Payment {
  ref: string
  amount: number
  currency: string
  motif: string
  status: PaymentStatus
  dueDate: string
  comment: string
  paymentDate?: string
  transferRef?: string
  exemptReason?: string
  /** Libellé affiché (n° facture ou nom de fichier) */
  invoiceRef?: string
  /** URL signée Airtable si le champ « Facture » est une pièce jointe */
  invoiceUrl?: string
}

export type TimelineEventType =
  | "payment_received"
  | "reminder"
  | "invoice_added"
  | "invoice_modified"
  | "overdue_alert"
  | "exemption_granted"

export interface TimelineEvent {
  id: string
  date: string
  type: TimelineEventType
  paymentRef: string
  invoiceRef?: string
  oldAmount?: number
  newAmount?: number
  reason?: string
  transferRef?: string
  daysLeft?: number
}
