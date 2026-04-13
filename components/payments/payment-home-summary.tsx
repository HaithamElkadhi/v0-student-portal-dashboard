"use client"

import { useEffect, useState } from "react"
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import type { Payment } from "@/lib/payment-types"
import { getPaymentDashboardSummaryLines, type PaymentSummaryLine } from "@/lib/payment-utils"

function toneIcon(tone: PaymentSummaryLine["tone"]) {
  switch (tone) {
    case "danger":
      return <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
    case "warning":
      return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden />
    case "success":
      return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-500" aria-hidden />
    default:
      return <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
  }
}

function toneTextClass(tone: PaymentSummaryLine["tone"]) {
  switch (tone) {
    case "danger":
      return "text-destructive"
    case "warning":
      return "text-amber-900 dark:text-amber-100"
    case "success":
      return "text-green-800 dark:text-green-200"
    default:
      return "text-muted-foreground"
  }
}

export function PaymentHomeSummary(props: { folderId: string; email: string }) {
  const { folderId, email } = props
  const [lines, setLines] = useState<PaymentSummaryLine[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!folderId?.trim() && !email?.trim()) {
      setLines(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectId: folderId ?? "", email: email ?? "" }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { payments?: Payment[]; error?: string }
        if (!res.ok) throw new Error(data.error || "Erreur")
        const list = Array.isArray(data.payments) ? data.payments : []
        if (!cancelled) setLines(getPaymentDashboardSummaryLines(list))
      })
      .catch(() => {
        if (!cancelled) setLines([{ tone: "muted", text: "Résumé indisponible pour le moment." }])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [folderId, email])

  if (loading) {
    return (
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <div className="h-3 max-w-[280px] animate-pulse rounded bg-muted" />
        <div className="h-3 max-w-[200px] animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (!lines?.length) return null

  return (
    <ul className="mt-4 space-y-2.5 border-t border-border pt-4" aria-label="Résumé des paiements">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-snug">
          {toneIcon(line.tone)}
          <span className={toneTextClass(line.tone)}>{line.text}</span>
        </li>
      ))}
    </ul>
  )
}
