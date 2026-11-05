import type { Payment } from "@/lib/payment-types"

const orientationCompletionFields = [
  "fldmG4KgxlZIWe5yC", "fldvzq0VUdgCELdRf", "fldGeykWH8oKFr03M", "fld1P0dI80wYuEXe1",
  "fldgGMhu1oFDV8YbF", "fldlr2jdQRHs74t9r", "fldsot30LGlll8oss", "fld2HHy6pgpQJmUNv",
  "flduGDlcArGZHrWOA", "fldC85ZK7TfLJc6N2", "fldWgAo9MCS0PQ0Qb", "fldIYBuTapsL6oHnz",
  "fldGVRtZ7aFnr5KM0", "fldUitTkCZNanMcID", "fldLPAvvz286zcxz2", "fldKXmKZb2TVgDfNE",
  "fldjhqSyAPCnznYAs", "fldqst8OaoMhb9xTJ", "fldLQp9TJZTDadP6L", "fld6WnYXTMlgzsQl3",
]

export function orientationCompletionPercent(fields: Record<string, unknown>): number {
  const filled = orientationCompletionFields.filter(id => {
    const value = fields[id]
    if (value == null) return false
    if (Array.isArray(value)) return value.length > 0
    return typeof value === "number" || String(value).trim() !== ""
  }).length
  return Math.round(filled / orientationCompletionFields.length * 100)
}

export function isOrientationComplete(percent: number | undefined): boolean {
  return typeof percent === "number" && percent >= 60
}

export function arePaymentsSettled(payments: Payment[] | null): boolean {
  return payments !== null && payments.every(payment => payment.status === "paid" || payment.status === "exempt")
}

export function isApplicationAccepted(status: string): boolean {
  return ["admitted", "accepted", "approved", "admis", "admise", "accepté", "acceptée"].includes(status.trim().toLowerCase())
}
