"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { AdmissionDetailsContent, type AdmissionData } from "@/components/admission-details"
import { ArrowUpRight, CheckCircle2, ClipboardList, CreditCard, Mail, RefreshCw } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useStudentPortal } from "@/components/student-portal-context"
import type { Payment } from "@/lib/payment-types"
import { formatMoney, formatDueDateLabel } from "@/lib/payment-utils"

type Summary = {
  admissionStatus: string[]; approvedUniversity: string; applicationsCount: number
  decisions: { university: string; program: string; status: string }[]
  admitted: { university: string; program: string; status: string }[]
  scholarshipStatus: string; visaStatus: string; appointmentDate: string
  mailCount: number | null; lastMail: { subject: string; date: string } | null
}
function Badge({ children, positive = false, warning = false, negative = false }: { children: ReactNode; positive?: boolean; warning?: boolean; negative?: boolean }) {
  return <span className={"inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-medium " + (positive ? "bg-emerald-50 text-emerald-800" : negative ? "bg-red-50 text-red-800" : warning ? "bg-amber-50 text-amber-800" : "bg-zinc-100 text-zinc-600")}>{children}</span>
}
function Panel({ title, icon, href, linkText, children, indicator }: { title: string; icon: ReactNode; href: string; linkText: string; children: ReactNode; indicator?: ReactNode }) {
  return <article className="flex min-w-0 flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
    <h2 className="flex items-center gap-2.5 text-sm font-semibold text-zinc-800"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173B65]/5 text-[#173B65]">{icon}</span>{title}{indicator}</h2>
    <div className="flex-1 pt-4">{children}</div>
    <Link href={href} className="mt-5 flex min-h-11 items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-sm font-medium text-[#173B65] focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]/30">{linkText}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /></Link>
  </article>
}
function Loading() { return <div role="status" className="space-y-3"><span className="sr-only">Chargement…</span><div className="h-6 w-2/3 animate-pulse rounded bg-zinc-100" /><div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" /></div> }
function LoadError({ retry }: { retry: () => void }) { return <div role="alert"><p className="text-sm text-zinc-500">Informations indisponibles pour le moment.</p><button onClick={retry} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#173B65]"><RefreshCw className="h-4 w-4" />Réessayer</button></div> }
export default function StudentProfileSummary() {
  const { studentInfo, isRefreshing } = useStudentPortal()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [payments, setPayments] = useState<Payment[] | null>(null)
  const [summaryError, setSummaryError] = useState(false)
  const [paymentError, setPaymentError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setSummaryError(false); setPaymentError(false)
    async function loadSummary() {
      try {
        const res = await fetch("/api/profile-summary?email=" + encodeURIComponent(studentInfo.email), { signal: controller.signal })
        const json = await res.json(); if (!res.ok) throw new Error()
        if (!controller.signal.aborted) setSummary(json)
      } catch { if (!controller.signal.aborted) setSummaryError(true) }
    }
    async function loadPayments() {
      try {
        const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prospectId: studentInfo.folderId, email: studentInfo.email }), signal: controller.signal })
        const json = await res.json(); if (!res.ok) throw new Error()
        if (!controller.signal.aborted) setPayments(json.payments || [])
      } catch { if (!controller.signal.aborted) setPaymentError(true) }
    }
    void loadSummary(); void loadPayments()
    return () => controller.abort()
  }, [studentInfo.email, studentInfo.folderId, isRefreshing, retry])
  const retryLoad = () => setRetry(value => value + 1)
  const due = (payments || []).filter(p => p.status === "due" || p.status === "overdue").sort((a,b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
  const admissions = summary?.admitted || []
  const decisions = summary?.decisions || []
  const admitted = admissions.length > 0
  const rejected = decisions.length > 0 && decisions.every(app => ["rejected", "refused", "refusé"].includes(app.status.toLowerCase()))
  return <section aria-label="Les informations essentielles de votre dossier" className="space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-zinc-700">Votre dossier en un coup d’œil</h2><span className="text-xs text-zinc-500">Suivi JEEXPERT</span></div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Décision d’admission" icon={<ClipboardList className="h-4 w-4" />} href="/student_italy/admission" linkText="Suivre mon admission">
        {summaryError ? <LoadError retry={retryLoad} /> : !summary ? <Loading /> : <>
          <div className="flex flex-wrap items-center justify-between gap-2"><Badge positive={admitted} negative={rejected} warning={!admitted && !rejected && summary.applicationsCount > 0}>{admitted ? "Admis" : rejected ? "Non admis" : summary.applicationsCount === 0 ? "Aucune candidature envoyée" : "En attente de décision"}</Badge><span className="text-sm font-semibold text-zinc-700">{summary.applicationsCount} candidature{summary.applicationsCount > 1 ? "s" : ""}</span></div>
          {admissions.length > 0 && <ul className="mt-3 space-y-2">{admissions.map((app,index) => <li key={app.university + index} className="rounded-lg bg-emerald-50 p-3"><p className="flex items-start gap-2 text-sm font-semibold text-emerald-900"><CheckCircle2 className="h-4 w-4 shrink-0" /><span className="break-words">{app.university || "Université à confirmer"}</span></p><p className="mt-1 break-words text-xs text-emerald-800">{app.program || "Formation à confirmer"}</p></li>)}</ul>}
          <AdmissionDetailsContent summaryOnly admissionData={studentInfo.admission as AdmissionData | undefined} prospectId={studentInfo.folderId} studentEmail={studentInfo.email} contratSigned={studentInfo.contratSigned} />
        </>}
      </Panel>
      <Panel title="Situation financière" icon={<CreditCard className="h-4 w-4" />} href="/student_italy/paiement" linkText="Consulter mes paiements" indicator={!paymentError && payments !== null ? <span role="img" aria-label={due.length ? "Paiement à régler" : "Aucun paiement à régler"} className={"ml-auto h-2.5 w-2.5 shrink-0 rounded-full " + (due.length ? "bg-red-500" : "bg-emerald-500")} /> : undefined}>
        {paymentError ? <LoadError retry={retryLoad} /> : !payments ? <Loading /> : !due.length ? <p className="text-sm text-emerald-700">Aucun paiement à régler</p> : <ul className="divide-y divide-zinc-100">{due.map((payment,index) => <li key={payment.ref + index} className="py-3 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-3"><p className="min-w-0 break-words text-sm font-medium text-zinc-700">{payment.motif && payment.motif !== "—" ? payment.motif : "Paiement à régler"}</p><span className="shrink-0 text-sm font-semibold text-zinc-900">{formatMoney(payment.amount, payment.currency)}</span></div><p className={"mt-1 text-xs " + (payment.status === "overdue" ? "text-red-700" : "text-zinc-500")}>{payment.status === "overdue" ? "En retard · " : "Échéance · "}{payment.dueDate ? formatDueDateLabel(payment.dueDate) : "Date à confirmer"}</p></li>)}</ul>}
      </Panel>
    </div>
    <Dialog><DialogTrigger asChild><button type="button" className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]/30"><Mail className="h-4 w-4 shrink-0 text-zinc-500" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-zinc-700">Messages de votre conseiller</p><p className="mt-1 break-words text-xs text-zinc-500">{summaryError ? "Historique indisponible" : !summary ? "Chargement…" : summary.mailCount === null ? "Historique indisponible" : summary.mailCount ? `${summary.mailCount} envoi(s) enregistré(s)` : "Aucun envoi enregistré"}{summary?.lastMail ? " · " + summary.lastMail.subject : ""}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400" /></button></DialogTrigger><DialogContent className="w-[calc(100%-2rem)] rounded-2xl"><DialogTitle>Work in progress</DialogTitle><DialogDescription>Le détail des notifications mail sera bientôt disponible.</DialogDescription></DialogContent></Dialog>
  </section>
}
