import type { Payment, TimelineEvent } from "./payment-types"

/** Données de démonstration — remplacées par l’API plus tard */
export const mockPayments: Payment[] = [
  {
    ref: "PAY-001",
    amount: 500,
    currency: "EUR",
    motif: "Frais de service initial",
    status: "due",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    comment: "Premier versement attendu après signature du contrat.",
    invoiceRef: "INV-222",
  },
  {
    ref: "PAY-002",
    amount: 1200,
    currency: "EUR",
    motif: "Frais université",
    status: "paid",
    dueDate: "2025-02-15",
    comment: "Réglé par virement.",
    invoiceRef: "INV-201",
  },
  {
    ref: "PAY-003",
    amount: 300,
    currency: "EUR",
    motif: "Option logement",
    status: "exempt",
    dueDate: "2025-04-01",
    comment: "Exonération accordée sur dossier.",
  },
  {
    ref: "PAY-004",
    amount: 250,
    currency: "EUR",
    motif: "Frais de dossier complémentaires",
    status: "overdue",
    dueDate: "2025-01-10",
    comment: "En attente de régularisation.",
    invoiceRef: "INV-198",
  },
]

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "ev-1",
    date: "2025-03-15T14:22:00.000Z",
    type: "payment_received",
    paymentRef: "PAY-002",
    invoiceRef: "INV-201",
    transferRef: "TRF-88421-IT",
  },
  {
    id: "ev-2",
    date: "2025-03-12T09:00:00.000Z",
    type: "reminder",
    paymentRef: "PAY-001",
    daysLeft: 7,
  },
  {
    id: "ev-3",
    date: "2025-03-08T11:30:00.000Z",
    type: "invoice_added",
    paymentRef: "PAY-001",
    invoiceRef: "INV-222",
  },
  {
    id: "ev-4",
    date: "2025-02-28T16:45:00.000Z",
    type: "invoice_modified",
    paymentRef: "PAY-004",
    invoiceRef: "INV-198",
    oldAmount: 200,
    newAmount: 250,
    reason: "Ajustement selon grille tarifaire 2025.",
  },
  {
    id: "ev-5",
    date: "2025-02-11T08:15:00.000Z",
    type: "overdue_alert",
    paymentRef: "PAY-004",
  },
]