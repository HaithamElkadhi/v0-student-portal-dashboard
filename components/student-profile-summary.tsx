"use client"

import { useEffect, useRef, useState } from "react"
import StudentJourneyTimeline from "@/components/student-journey-timeline"
import { Activity, RefreshCw, Phone, Ticket, CalendarDays, Mail, LifeBuoy, type LucideIcon } from "lucide-react"
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
const activityTypes: Record<string, { label: string; icon: LucideIcon }> = {
  contact: { label: "Contact", icon: Phone },
  ticket: { label: "Ticket", icon: Ticket },
  appointment: { label: "Rendez-vous", icon: CalendarDays },
  email: { label: "E-mail envoyé", icon: Mail },
}

const activityStatuses: Record<string, string> = {
  Scheduled: "Planifié", Completed: "Terminé", Cancelled: "Annulé", "No-show": "Absent",
  Done: "Terminé", Archived: "Archivé", "In Progress": "En cours", Todo: "À traiter",
}

function activityDate(value: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Date non renseignée"
  const date = new Date(value.length === 10 ? value + "T12:00:00+01:00" : value)
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Tunis" })
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
  return <section aria-label="Le suivi de votre dossier" className="space-y-5 sm:space-y-7">
    <StudentJourneyTimeline summary={summary} payments={payments} summaryError={summaryError} paymentError={paymentError} loading={(!summary && !summaryError) || (payments === null && !paymentError)} />
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] xl:gap-6">
      <article className="min-w-0 rounded-2xl border border-[#BCD6EC] bg-white p-5 sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-[#092C51] sm:text-2xl">Activité récente</h2>
        <div className="mt-3">
          {summaryError ? <LoadError retry={retryLoad} /> : !summary ? <Loading /> : <>
            {summary.activityPartial && <p className="mb-3 text-xs text-amber-700">Certaines activités sont indisponibles. Actualisez pour réessayer.</p>}
            {!summary.activity?.length ? <p className="py-4 text-sm text-slate-600">Aucune activité enregistrée.</p> : (
              <ol ref={activityListRef} aria-label="Historique des activités" tabIndex={activityScrolls ? 0 : undefined} style={{ maxHeight: activityMaxHeight }} className="divide-y divide-slate-200 overflow-y-auto overscroll-y-contain rounded-lg pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]">
                {summary.activity.map(event => {
                  const { label, icon: Icon } = activityTypes[event.kind] || { label: "Activité", icon: Activity }
                  return <li key={event.key} className="flex min-w-0 items-start gap-3 py-3 sm:gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F4FB] text-[#173B65] sm:size-12"><Icon className="size-5" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <h3 className="text-sm font-semibold text-[#092C51] sm:text-base">{label}</h3>
                        <time className="text-xs text-slate-600 sm:text-sm">{activityDate(event.at)}</time>
                      </div>
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{event.title}</p>
                      {event.appointmentAt && <p className="mt-1 text-xs text-slate-600">Prévu le {new Date(event.appointmentAt).toLocaleString("fr-FR", { timeZone: "Africa/Tunis", dateStyle: "medium", timeStyle: "short" })}</p>}
                      {event.status && event.kind !== "email" && <p className="mt-1 text-xs text-slate-600">{activityStatuses[event.status] || event.status}</p>}
                    </div>
                  </li>
                })}
              </ol>
            )}
          </>}
        </div>
      </article>
      <aside aria-labelledby="student-help-heading" className="flex h-full flex-col rounded-2xl border border-[#BCD6EC] bg-white p-5 sm:p-6">
        <h2 id="student-help-heading" className="text-xl font-semibold tracking-tight text-[#092C51] sm:text-2xl">Besoin d’aide ?</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">Contactez votre équipe JEEXPERT.</p>
        <a href="https://wa.me/393520880880" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#173B65] px-4 py-2 text-center text-sm font-semibold text-[#173B65] transition-colors hover:bg-[#E8F4FB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65]">
          <LifeBuoy className="size-4 shrink-0 xl:hidden" aria-hidden="true" /> Contacter JEEXPERT
        </a>
      </aside>
    </div>
  </section>
}
