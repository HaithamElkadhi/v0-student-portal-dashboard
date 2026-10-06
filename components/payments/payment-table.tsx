"use client"

import type { Payment, PaymentStatus } from "@/lib/payment-types"
import {
  daysUntilDue,
  formatAmountFr,
  formatDueDateLabel,
  formatMoney,
  getUrgentDuePayment,
  isDueWithinDays,
  statusToFrench,
} from "@/lib/payment-utils"

const textPrimary = "var(--payment-text-primary)"
const textSecondary = "var(--payment-text-secondary)"
const bgSecondary = "var(--payment-bg-secondary)"
const borderTertiary = "var(--payment-border-tertiary)"

function WarningCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="#633806" strokeWidth="1.5" />
      <path d="M12 8v5M12 16h.01" stroke="#633806" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const label = statusToFrench(status)
  const styles: Record<PaymentStatus, { bg: string; color: string }> = {
    paid: { bg: "#EAF3DE", color: "#27500A" },
    due: { bg: "#FAEEDA", color: "#633806" },
    exempt: { bg: "#EEEDFE", color: "#3C3489" },
    overdue: { bg: "#FCEBEB", color: "#791F1F" },
  }
  const s = styles[status]
  return (
    <span
      className="inline-flex max-w-full items-center gap-[5px] whitespace-nowrap rounded-[20px] px-[9px] py-[3px] text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="size-[5px] shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
      {label}
    </span>
  )
}

export interface PaymentTableProps {
  payments: Payment[]
  onInvoiceOpen: (paymentRef: string, invoiceRef: string) => void
  invoiceHref?: (payment: Payment) => string
}

export function PaymentTable({ payments, onInvoiceOpen, invoiceHref }: PaymentTableProps) {
  const urgent = getUrgentDuePayment(payments)

  return (
    <section>
      {urgent ? (
        <div
          className="mb-4 flex items-start gap-2.5 rounded-lg border-[0.5px] px-3.5 py-2.5"
          style={{ background: "#FAEEDA", borderColor: "#FAC775" }}
          role="status"
        >
          <WarningCircleIcon className="mt-0.5 shrink-0" />
          <p className="text-[12px] leading-[1.5]" style={{ color: "#633806" }}>
            Rappel : Le paiement <strong>{urgent.ref}</strong> (
            {formatMoney(urgent.amount, urgent.currency)} — {urgent.motif}) est dû dans{" "}
            <strong>{daysUntilDue(urgent.dueDate)} jours</strong> ({formatDueDateLabel(urgent.dueDate)}). Veuillez
            régulariser avant la date limite.
          </p>
        </div>
      ) : null}

      <div className="space-y-3 md:hidden">
        {!payments.length && <p className="py-6 text-center text-sm text-zinc-500">Aucun paiement trouvé.</p>}
        {payments.map((p, index) => <article key={p.ref + index} className="min-w-0 rounded-xl border border-zinc-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xl font-semibold text-zinc-900">{formatMoney(p.amount, p.currency)}</p><StatusBadge status={p.status} /></div>
          <p className="mt-3 break-words text-sm font-medium text-zinc-800">{p.motif === "—" ? "Motif non renseigné" : p.motif}</p>
          <p className="mt-1 break-all text-xs text-zinc-400">{p.ref}</p>
          <div className="mt-3 flex flex-wrap justify-between gap-2 rounded-lg bg-zinc-50 p-3 text-xs"><span className="text-zinc-500">Échéance</span><span className="font-semibold text-zinc-800">{p.dueDate ? formatDueDateLabel(p.dueDate) : "Non renseignée"}</span></div>
          {p.comment && <p className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-500">{p.comment}</p>}
          {p.invoiceUrl && <a href={invoiceHref ? invoiceHref(p) : p.invoiceUrl} download className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 text-sm font-medium text-blue-900"><DocIcon />Télécharger la facture PDF</a>}
        </article>)}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table
          className="w-full min-w-[800px] table-fixed border-collapse text-left"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 95 }} />
            <col style={{ width: 85 }} />
            <col style={{ width: 68 }} />
            <col style={{ width: 145 }} />
            <col style={{ width: 95 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 145 }} />
            <col style={{ width: 95 }} />
          </colgroup>
          <thead>
            <tr style={{ background: bgSecondary, borderBottom: `0.5px solid ${borderTertiary}` }}>
              {["Réf.", "Montant", "Devise", "Motif", "Statut", "Échéance", "Commentaire", "Facture"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[11px] font-medium"
                    style={{ color: textSecondary }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm"
                  style={{ color: textSecondary }}
                >
                  Aucun paiement trouvé pour ce dossier.
                </td>
              </tr>
            ) : null}
            {payments.map((p, idx) => {
              const isLast = idx === payments.length - 1
              const warnDue = p.status === "due" && isDueWithinDays(p, 7)
              const rowBg =
                p.status === "due"
                  ? "#fffbf5"
                  : p.status === "overdue"
                    ? "#fff8f8"
                    : "transparent"
              return (
                <tr
                  key={`${p.ref}-${idx}`}
                  style={{
                    borderBottom: isLast ? "none" : `0.5px solid ${borderTertiary}`,
                    background: rowBg,
                  }}
                >
                  <td className="px-3 py-[11px] font-mono text-xs" style={{ color: textSecondary }}>
                    {p.ref}
                  </td>
                  <td
                    className="px-3 py-[11px] text-sm font-medium"
                    style={{
                      color:
                        p.status === "due"
                          ? "#633806"
                          : p.status === "exempt"
                            ? "#3C3489"
                            : textPrimary,
                      textDecoration: p.status === "exempt" ? "line-through" : undefined,
                    }}
                  >
                    {formatAmountFr(p.amount)}
                  </td>
                  <td className="px-3 py-[11px]">
                    <span
                      className="inline-block rounded px-[7px] py-0.5 text-[11px] font-medium"
                      style={{ background: bgSecondary, color: textSecondary }}
                    >
                      {p.currency}
                    </span>
                  </td>
                  <td className="px-3 py-[11px] text-xs" style={{ color: textSecondary }}>
                    {p.motif}
                  </td>
                  <td className="px-3 py-[11px]">
                    <StatusBadge status={p.status} />
                  </td>
                  <td
                    className="px-3 py-[11px] text-xs"
                    style={{
                      color: warnDue ? "#633806" : textSecondary,
                      fontWeight: warnDue ? 500 : 400,
                    }}
                  >
                    {formatDueDateLabel(p.dueDate)}
                    {warnDue ? " ⚠" : ""}
                  </td>
                  <td
                    className="max-w-[145px] truncate px-3 py-[11px] text-xs italic"
                    style={{ color: textSecondary }}
                    title={p.comment}
                  >
                    {p.comment}
                  </td>
                  <td className="px-3 py-[11px]">
                    {p.invoiceUrl ? (
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                        style={{ background: "#E6F1FB", color: "#0C447C" }}
                      >
                        <DocIcon className="shrink-0 text-[#0C447C]" />
                        <span className="truncate">Télécharger PDF</span>
                      </a>
                    ) : p.invoiceRef ? (
                      <button
                        type="button"
                        onClick={() => onInvoiceOpen(p.ref, p.invoiceRef!)}
                        className="inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                        style={{ background: "#E6F1FB", color: "#0C447C" }}
                      >
                        <DocIcon className="shrink-0 text-[#0C447C]" />
                        <span className="truncate">{p.invoiceRef}</span>
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: textSecondary }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
