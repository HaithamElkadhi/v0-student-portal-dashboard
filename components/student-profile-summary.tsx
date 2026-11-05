"use client"

import { useEffect, useRef, useState } from "react"
import StudentJourneyTimeline from "@/components/student-journey-timeline"
import { Activity, RefreshCw, Phone, Ticket, CalendarDays, Mail, type LucideIcon } from "lucide-react"
import { useStudentPortal } from "@/components/student-portal-context"
import type { Payment } from "@/lib/payment-types"

type Summary = {
  orientationPercent: number
  admissionStatus: string[]; approvedUniversity: string; applicationsCount: number
  decisions: { university: string; program: string; status: string }[]
  admitted: { university: string; program: string; status: string }[]
  scholarshipStatus: string; visaStatus: string; appointmentDate: string
  activity: { key: string; kind: string; at: string; title: string; status?: string; appointmentAt?: string }[]; activityPartial: boolean
  lastContactDate: string; lastContactReason: string
  mailCount: number | null; lastMail: { subject: string; date: string } | null
}
const activityTypes: Record<string, { label: string; icon: LucideIcon; badge: string; tile: string; row: string }> = {
  contact: { label: "Contact", icon: Phone, badge: "bg-emerald-50 text-emerald-800", tile: "bg-emerald-600 text-white", row: "hover:bg-emerald-50/50" },
  ticket: { label: "Ticket", icon: Ticket, badge: "bg-amber-50 text-amber-800", tile: "bg-amber-500 text-amber-950", row: "hover:bg-amber-50/50" },
  appointment: { label: "Rendez-vous", icon: CalendarDays, badge: "bg-violet-50 text-violet-800", tile: "bg-violet-600 text-white", row: "hover:bg-violet-50/50" },
  email: { label: "Email envoyé", icon: Mail, badge: "bg-red-50 text-red-800", tile: "bg-[#EA4335] text-white", row: "hover:bg-red-50/50" },
}
const defaultActivityType = { label: "Activité", icon: Activity, badge: "bg-slate-100 text-slate-700", tile: "bg-slate-600 text-white", row: "hover:bg-slate-50" }

function ActivityBadge({ kind }: { kind: string }) {
  const { label, icon: Icon, badge, tile } = activityTypes[kind] || defaultActivityType
  return <span className="inline-flex items-center gap-2"><span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm " + tile}><Icon className="h-4.5 w-4.5" aria-hidden="true" /></span><span className={"rounded-full px-2.5 py-1 text-xs font-medium " + badge}>{label}</span></span>
}

function Loading() { return <div role="status" className="space-y-3"><span className="sr-only">Chargement…</span><div className="h-6 w-2/3 animate-pulse rounded bg-zinc-100" /><div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" /></div> }
function LoadError({ retry }: { retry: () => void }) { return <div role="alert"><p className="text-sm text-zinc-500">Informations indisponibles pour le moment.</p><button onClick={retry} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#173B65]"><RefreshCw className="h-4 w-4" />Réessayer</button></div> }
export default function StudentProfileSummary() {
  const { studentInfo, isRefreshing } = useStudentPortal()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryError, setSummaryError] = useState(false)
  const activityListRef = useRef<HTMLOListElement>(null)
  const [activityMaxHeight, setActivityMaxHeight] = useState<number>()
  const activityScrolls = (summary?.activity?.length || 0) > 4
  useEffect(() => {
    const list = activityListRef.current
    if (!list || !activityScrolls) {
      setActivityMaxHeight(undefined)
      return
    }
    const visibleItems = Array.from(list.children).slice(0, 4)
    const measure = () => {
      const first = visibleItems[0]?.getBoundingClientRect()
      const fourth = visibleItems[3]?.getBoundingClientRect()
      if (first && fourth) setActivityMaxHeight(Math.ceil(fourth.bottom - first.top))
    }
    const observer = new ResizeObserver(measure)
    visibleItems.forEach(item => observer.observe(item))
    measure()
    return () => observer.disconnect()
  }, [summary, summaryError, activityScrolls])
  const [payments, setPayments] = useState<Payment[] | null>(null)
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
  return <section aria-label="Le suivi de votre dossier" className="space-y-5 sm:space-y-6">
    <StudentJourneyTimeline summary={summary} payments={payments} summaryError={summaryError} paymentError={paymentError} loading={(!summary && !summaryError) || (payments === null && !paymentError)} />
    <article className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-sky-50/70 via-white to-violet-50/40 p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-zinc-800">Historique des activités</h2>
      <div className="mt-3">{summaryError ? <LoadError retry={retryLoad} /> : !summary ? <Loading /> : <>
        {summary.activityPartial && <p className="mb-3 text-xs text-amber-700">Certaines activités sont indisponibles. Actualisez pour réessayer.</p>}
        {!summary.activity?.length ? <p className="text-sm text-zinc-500">Aucune activité enregistrée.</p> : <ol ref={activityListRef} aria-label="Historique des activités" tabIndex={activityScrolls ? 0 : undefined} style={{ maxHeight: activityMaxHeight }} className="space-y-3 overflow-y-auto overscroll-y-contain rounded-xl pr-2 [scrollbar-gutter:stable] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]">{summary.activity.map(event => <li key={event.key} className={"rounded-xl border border-zinc-100 bg-white p-3 transition-colors motion-reduce:transition-none sm:p-4 " + (activityTypes[event.kind] || defaultActivityType).row}>
          <div className="flex flex-wrap items-center justify-between gap-2"><ActivityBadge kind={event.kind} /><time className="text-xs text-zinc-400">{event.at && Number.isFinite(Date.parse(event.at)) ? new Date(event.at.length === 10 ? event.at + "T12:00:00+01:00" : event.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Tunis" }) : "Date non renseignée"}</time></div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-800">{event.title}</p>
          {event.appointmentAt && <p className="mt-1 text-xs text-zinc-500">Prévu le {new Date(event.appointmentAt).toLocaleString("fr-FR", { timeZone: "Africa/Tunis", dateStyle: "medium", timeStyle: "short" })}</p>}
          {event.status && event.kind !== "email" && <p className="mt-1 text-xs text-zinc-500">{{ Scheduled: "Planifié", Completed: "Terminé", Cancelled: "Annulé", "No-show": "Absent", Done: "Terminé", Archived: "Archivé", "In Progress": "En cours", Todo: "À traiter" }[event.status] || event.status}</p>}
        </li>)}</ol>}
      </>}</div>
    </article>
  </section>
}
