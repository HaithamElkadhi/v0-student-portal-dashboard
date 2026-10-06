"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardList, CreditCard, GraduationCap, Plane, Mail, ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useStudentPortal } from "@/components/student-portal-context"
import type { Payment } from "@/lib/payment-types"
import { formatMoney, formatDueDateLabel } from "@/lib/payment-utils"

type Summary = {
  admissionStatus: string[]; approvedUniversity: string; applicationsCount: number
  admitted: { university: string; program: string; status: string }[]
  scholarshipStatus: string; visaStatus: string; appointmentDate: string
  mailCount: number | null; lastMail: { subject: string; date: string } | null
}
const labels: Record<string, string> = {
  Applied: "Candidatures envoyées", Admitted: "Admis", Ready: "Prêt pour les candidatures", "Start For Free": "Dossier démarré",
  "Not Started": "Non commencée", Submitted: "Demande déposée", Accepted: "Acceptée", Rejected: "Refusée",
  "Not Concerned": "Non concerné", "DDL Missed": "Date limite dépassée",
  "Appointment Booked": "Rendez-vous réservé", Approved: "Visa accordé",
}
function label(value: string) { return labels[value.trim()] || value.trim() }
function date(value: string) {
  if (!value) return "Date à confirmer"
  const parsed = new Date(value.length === 10 ? value + "T12:00:00" : value)
  return Number.isNaN(parsed.getTime()) ? "Date à confirmer" : parsed.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Tunis" })
}
const cardClass = "min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
const titleClass = "flex items-center gap-2 text-sm font-semibold text-zinc-900"
const linkClass = "mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
export default function StudentProfileSummary() {
  const { studentInfo, isRefreshing } = useStudentPortal()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [payments, setPayments] = useState<Payment[] | null>(null)
  const [summaryError, setSummaryError] = useState(false)
  const [paymentError, setPaymentError] = useState(false)
  useEffect(() => {
    let cancelled = false
    setSummary(null); setPayments(null); setSummaryError(false); setPaymentError(false)
    async function loadSummary() {
      try {
        const res = await fetch("/api/profile-summary?email=" + encodeURIComponent(studentInfo.email))
        const json = await res.json()
        if (!res.ok) throw new Error()
        if (!cancelled) setSummary(json)
      } catch { if (!cancelled) setSummaryError(true) }
    }
    async function loadPayments() {
      try {
        const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prospectId: studentInfo.folderId, email: studentInfo.email }) })
        const json = await res.json()
        if (!res.ok) throw new Error()
        if (!cancelled) setPayments(json.payments || [])
      } catch { if (!cancelled) setPaymentError(true) }
    }
    void loadSummary(); void loadPayments()
    return () => { cancelled = true }
  }, [studentInfo.email, studentInfo.folderId, isRefreshing])
  const due = payments?.filter(payment => payment.status === "due" || payment.status === "overdue").sort((a,b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")) || []
  const waiting = summaryError ? "Résumé indisponible. Réessayez avec Actualiser." : "Chargement…"
  const admissions = summary?.admitted || []
  return <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Résumé de votre dossier">
    <Card className={cardClass}>
      <h2 className={titleClass}><ClipboardList className="h-4 w-4 text-zinc-500" />Admission et candidatures</h2>
      {!summary ? <p className="mt-3 text-sm text-zinc-500" role="status">{waiting}</p> : <>
        <p className="mt-3 text-base font-semibold text-zinc-900">{admissions.length ? "Admis" : summary.admissionStatus.length ? summary.admissionStatus.map(label).join(" · ") : "Statut à confirmer"}</p>
        <p className="mt-1 text-sm text-zinc-500">{summary.applicationsCount} candidature{summary.applicationsCount > 1 ? "s" : ""} dans votre dossier</p>
        {admissions.length ? <ul className="mt-3 space-y-2">{admissions.map((app,index) => <li key={app.university + index} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3"><p className="break-words text-sm font-semibold text-emerald-900">{app.university || "Université à confirmer"}</p><p className="mt-1 break-words text-sm text-emerald-800">{app.program || "Programme à confirmer"}</p></li>)}</ul> : summary.approvedUniversity && !["accepted", "admitted", "approved", "refused", "rejected"].includes(summary.approvedUniversity.trim().toLowerCase()) && <p className="mt-3 break-words text-sm text-zinc-700">Université retenue : <strong>{summary.approvedUniversity}</strong></p>}
      </>}
      <Link className={linkClass} href="/student_italy/admission">Voir mon admission<ArrowUpRight className="h-3.5 w-3.5" /></Link>
    </Card>
    <Card className={cardClass}>
      <h2 className={titleClass}><CreditCard className="h-4 w-4 text-zinc-500" />Paiements à prévoir</h2>
      {paymentError ? <p className="mt-3 text-sm text-zinc-500">Paiements indisponibles. Réessayez avec Actualiser.</p> : !payments ? <p className="mt-3 text-sm text-zinc-500" role="status">Chargement…</p> : due.length === 0 ? <p className="mt-3 text-sm text-emerald-700">Aucun paiement à régler pour le moment.</p> : <ul className="mt-3 space-y-3">{due.map((payment,index) => <li key={payment.ref + index} className={"rounded-lg border p-3 " + (payment.status === "overdue" ? "border-red-100 bg-red-50" : "border-amber-100 bg-amber-50")}><div className="flex flex-wrap items-start justify-between gap-2"><p className="min-w-0 break-words text-sm font-medium text-zinc-800">{payment.motif || payment.ref}</p><p className="text-sm font-semibold text-zinc-900">{formatMoney(payment.amount, payment.currency)}</p></div><p className="mt-1 text-xs text-zinc-600">{payment.status === "overdue" ? "En retard · " : ""}Échéance : {payment.dueDate ? formatDueDateLabel(payment.dueDate) : "À confirmer"}</p></li>)}</ul>}
      <Link className={linkClass} href="/student_italy/paiement">Voir mes paiements<ArrowUpRight className="h-3.5 w-3.5" /></Link>
    </Card>
    <Card className={cardClass}><h2 className={titleClass}><GraduationCap className="h-4 w-4 text-zinc-500" />Bourse</h2><p className="mt-3 text-base font-semibold text-zinc-900">{summary ? summary.scholarshipStatus ? label(summary.scholarshipStatus) : "Statut à confirmer" : waiting}</p><Link className={linkClass} href="/student_italy/bourse">Voir mon dossier bourse<ArrowUpRight className="h-3.5 w-3.5" /></Link></Card>
    <Card className={cardClass}><h2 className={titleClass}><Plane className="h-4 w-4 text-zinc-500" />Visa et rendez-vous</h2><p className="mt-3 text-base font-semibold text-zinc-900">{summary ? summary.visaStatus ? label(summary.visaStatus) : "Statut à confirmer" : waiting}</p>{summary && <p className="mt-2 text-sm text-zinc-500">{summary.appointmentDate ? "Rendez-vous visa : " + date(summary.appointmentDate) : "Aucune date de rendez-vous renseignée."}</p>}<Link className={linkClass} href="/student_italy/visa">Voir mon suivi visa<ArrowUpRight className="h-3.5 w-3.5" /></Link></Card>
    <Card className={cardClass + " md:col-span-2"}>
      <Dialog><DialogTrigger asChild><button type="button" className="w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--jx-terracotta)]/40"><h2 className={titleClass}><Mail className="h-4 w-4 text-zinc-500" />Notifications mail<ArrowUpRight className="ml-auto h-4 w-4 text-zinc-400" /></h2><p className="mt-3 text-sm text-zinc-600">{!summary ? waiting : summary.mailCount === null ? "Historique des mails indisponible." : summary.mailCount === 0 ? "Aucun envoi de mail enregistré dans le suivi." : summary.mailCount + " envoi(s) de mail enregistré(s)."} </p>{summary?.lastMail && <p className="mt-1 break-words text-xs text-zinc-500">{summary.lastMail.subject} · {date(summary.lastMail.date)}</p>}</button></DialogTrigger><DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-zinc-200 bg-white"><DialogTitle>Work in progress</DialogTitle><DialogDescription>Le détail des notifications mail sera bientôt disponible.</DialogDescription></DialogContent></Dialog>
    </Card>
  </section>
}
