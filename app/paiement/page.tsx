"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PaymentTable } from "@/components/payments/payment-table"
import { PaymentTimeline } from "@/components/payments/payment-timeline"
import type { Payment, PaymentStatus, TimelineEvent } from "@/lib/payment-types"
import { sortTimelineDesc } from "@/lib/payment-utils"

interface StudentInfo {
  name: string
  email: string
  folderId: string
}

export default function PaiementPage() {
  const router = useRouter()
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("studentInfo")
    if (raw) {
      try {
        setStudentInfo(JSON.parse(raw))
      } catch {
        router.push("/")
      }
    } else {
      router.push("/")
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (!studentInfo) return
    if (!studentInfo.folderId && !studentInfo.email) return

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
          setTimeline(Array.isArray(data.timeline) ? data.timeline : [])
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
  }, [studentInfo])

  const timelineSorted = sortTimelineDesc(timeline)

  function handlePaymentAction(paymentRef: string, status: PaymentStatus) {
    void paymentRef
    void status
  }

  function handleInvoiceOpen(paymentRef: string, invoiceRef: string) {
    void paymentRef
    void invoiceRef
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Chargement…</p>
        </div>
      </div>
    )
  }

  if (!studentInfo) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/student_italy"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            {studentInfo.folderId}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="sr-only">Paiements</h1>

        {fetchError ? (
          <div
            className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {fetchError}
          </div>
        ) : null}

        {loadingPayments ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <PaymentTable
              payments={payments}
              onPaymentAction={handlePaymentAction}
              onInvoiceOpen={handleInvoiceOpen}
            />
            <PaymentTimeline events={timelineSorted} payments={payments} />
          </div>
        )}
      </main>
    </div>
  )
}
