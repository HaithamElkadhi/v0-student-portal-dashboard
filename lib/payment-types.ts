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
  exemptReason?: string
  /** Texte ou nom de fichier depuis le champ « Facture » */
  invoiceRef?: string
  /** URL signée Airtable si « Facture » est une pièce jointe */
  invoiceUrl?: string
  /** Création de la ligne (réponse API Airtable) */
  createdTime?: string
  /** Champ « Last modification » / équivalent, sinon ≈ createdTime */
  lastModifiedAt?: string
}
