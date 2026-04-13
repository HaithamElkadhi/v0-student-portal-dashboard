"use client"

import type { Payment, TimelineEvent } from "@/lib/payment-types"
import { formatAmountFr, formatFrDateTime } from "@/lib/payment-utils"

const textPrimary = "var(--payment-text-primary)"
const textSecondary = "var(--payment-text-secondary)"
const borderTertiary = "var(--payment-border-tertiary)"

export interface PaymentTimelineProps {
  events: TimelineEvent[]
  payments: Payment[]
}

function paymentByRef(payments: Payment[], ref: string): Payment | undefined {
  return payments.find((p) => p.ref === ref)
}

const dotColors: Record<TimelineEvent["type"], string> = {
  payment_received: "#639922",
  reminder: "#BA7517",
  invoice_added: "#378ADD",
  invoice_modified: "#7F77DD",
  overdue_alert: "#E24B4A",
  exemption_granted: "#7F77DD",
}

const tagStyles: Record<TimelineEvent["type"], { bg: string; color: string; label: string }> = {
  payment_received: { bg: "#EAF3DE", color: "#27500A", label: "Paiement reçu" },
  reminder: { bg: "#FAEEDA", color: "#633806", label: "Rappel automatique" },
  invoice_added: { bg: "#E6F1FB", color: "#0C447C", label: "Nouvelle facture" },
  invoice_modified: { bg: "#EEEDFE", color: "#3C3489", label: "Facture modifiée" },
  overdue_alert: { bg: "#FCEBEB", color: "#791F1F", label: "Alerte retard" },
  exemption_granted: { bg: "#EEEDFE", color: "#3C3489", label: "Exonération accordée" },
}

function euro(amount: number): string {
  return `€ ${formatAmountFr(amount)}`
}

function dateSlash(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

export function PaymentTimeline({ events, payments }: PaymentTimelineProps) {
  return (
    <section
      className="rounded-xl border-[0.5px] bg-white px-5 py-4"
      style={{ borderColor: borderTertiary }}
    >
      <h2 className="mb-4 text-[13px] font-medium" style={{ color: textPrimary }}>
        Historique des paiements
      </h2>
      <div>
        {events.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: textSecondary }}>
            Aucun historique pour le moment.
          </p>
        ) : null}
        {events.map((ev, i) => {
          const isLast = i === events.length - 1
          const pay = paymentByRef(payments, ev.paymentRef)
          const tag = tagStyles[ev.type]
          return (
            <div
              key={ev.id}
              className={`grid items-start gap-x-3 max-md:grid-cols-[70px_16px_1fr] md:grid-cols-[90px_16px_1fr] ${isLast ? "pt-3 pb-0" : "border-b-[0.5px] py-3"}`}
              style={{ borderColor: !isLast ? borderTertiary : undefined }}
            >
              <div
                className="pt-0.5 text-right text-[11px] leading-[1.5] max-md:w-[70px]"
                style={{ color: textSecondary }}
              >
                {formatFrDateTime(ev.date)}
              </div>
              <div className="flex w-4 justify-center pt-1">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: dotColors[ev.type] }}
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <span
                  className="mb-1 inline-block rounded-[20px] px-[7px] py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: tag.bg, color: tag.color }}
                >
                  {tag.label}
                </span>
                <TimelineEventBody event={ev} payment={pay} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TimelineEventBody({ event, payment }: { event: TimelineEvent; payment?: Payment }) {
  const textPrimaryStyle = { color: textPrimary }
  const textSecStyle = { color: textSecondary }

  switch (event.type) {
    case "payment_received": {
      if (!payment) return null
      return (
        <>
          <p className="text-[13px] leading-[1.5]" style={textPrimaryStyle}>
            Paiement <strong className="font-medium">{event.paymentRef}</strong> confirmé —{" "}
            <strong className="font-medium">{euro(payment.amount)}</strong>
            {payment.motif ? <> ({payment.motif})</> : null}. Reçu le{" "}
            <strong className="font-medium">{payment.paymentDate ? dateSlash(payment.paymentDate) : dateSlash(event.date)}</strong>.
          </p>
          {event.transferRef ? (
            <p className="mt-1 font-mono text-[11px]" style={textSecStyle}>
              Réf. virement : {event.transferRef}.
            </p>
          ) : null}
        </>
      )
    }
    case "reminder": {
      if (!payment) return null
      const n = event.daysLeft ?? 7
      return (
        <>
          <p className="text-[13px] leading-[1.5]" style={textPrimaryStyle}>
            {n <= 3 ? (
              <>
                Rappel J-3 : <strong className="font-medium">{event.paymentRef}</strong>
                {payment.motif ? <> — {payment.motif}</> : null} (
                <strong className="font-medium">{euro(payment.amount)}</strong>) non encore réglé.
              </>
            ) : (
              <>
                Échéance dans 7 jours pour <strong className="font-medium">{event.paymentRef}</strong> —{" "}
                <strong className="font-medium">{euro(payment.amount)}</strong>
                {payment.motif ? <> ({payment.motif})</> : null}.
              </>
            )}
          </p>
        </>
      )
    }
    case "invoice_added": {
      if (!payment || !event.invoiceRef) return null
      return (
        <>
          <p className="text-[13px] leading-[1.5]" style={textPrimaryStyle}>
            Facture <strong className="font-medium">{event.invoiceRef}</strong> générée pour{" "}
            <strong className="font-medium">{event.paymentRef}</strong>
            {payment.motif ? <> — {payment.motif}</> : null} · {euro(payment.amount)}. Échéance fixée au{" "}
            <strong className="font-medium">{dateSlash(payment.dueDate)}</strong>.
          </p>
        </>
      )
    }
    case "invoice_modified": {
      if (!event.invoiceRef) return null
      return (
        <>
          <p className="text-[13px] leading-[1.5]" style={textPrimaryStyle}>
            La facture <strong className="font-medium">{event.invoiceRef}</strong> a été mise à jour.
          </p>
          {event.reason ? <p className="mt-1 text-xs leading-[1.5]" style={textSecStyle}>{event.reason}</p> : null}
        </>
      )
    }
    case "overdue_alert":
      if (!payment) return null
      return (
        <>
          <p className="text-[13px] leading-[1.5]" style={textPrimaryStyle}>
            Paiement <strong className="font-medium">{event.paymentRef}</strong> en retard —{" "}
            {euro(payment.amount)}
            {payment.motif ? <> ({payment.motif})</> : null}. Échéance dépassée depuis le{" "}
            <strong className="font-medium">{dateSlash(payment.dueDate)}</strong>.
          </p>
        </>
      )
    case "exemption_granted":
      if (!payment) return null
      return (
        <>
          <p className="text-[13px] leading-[1.5]" style={textPrimaryStyle}>
            Paiement <strong className="font-medium">{event.paymentRef}</strong> exonéré — {euro(payment.amount)}
            {payment.motif ? <> ({payment.motif})</> : null} dispensé.
          </p>
          {payment.exemptReason ? (
            <p className="mt-1 text-xs leading-[1.5]" style={textSecStyle}>
              {payment.exemptReason}
            </p>
          ) : null}
        </>
      )
    default:
      return null
  }
}
