"use client"

import { useEffect, useState } from "react"
import { PaymentTable } from "@/components/payments/payment-table"
import type { Payment } from "@/lib/payment-types"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentPaymentsPanel() {
  const { studentInfo } = useStudentPortal()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentInfo.folderId?.trim() && !studentInfo.email?.trim()) return

    let cancelled = false
    setLoadingPayments(true)
    setFetchError(null)

    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospectId: studentInfo.folderId,
        email: studentInfo.email,
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Impossible de charger les paiements")
        }
        if (!cancelled) {
          setPayments(Array.isArray(data.payments) ? data.payments : [])
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setFetchError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingPayments(false)
      })

    return () => {
      cancelled = true
    }
  }, [studentInfo.folderId, studentInfo.email])

  function handleInvoiceOpen(paymentRef: string, invoiceRef: string) {
    void paymentRef
    void invoiceRef
  }

  return (
    <>
      <h1 className="sr-only">Paiements</h1>

      {fetchError ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {fetchError}
        </div>
      ) : null}

      {loadingPayments ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500"
            aria-hidden
          />
          Chargement…
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
          <PaymentTable payments={payments} onInvoiceOpen={handleInvoiceOpen} invoiceHref={payment => "/api/payments/invoice?" + new URLSearchParams({ prospectId: studentInfo.folderId, email: studentInfo.email, ref: payment.ref })} />
        </div>
      )}
    </>
  )
}
