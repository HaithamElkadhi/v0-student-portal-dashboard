"use client"

import Link from "next/link"
import { Check, Users, CreditCard, FolderOpen, Landmark, BookUser, GraduationCap, Plane, type LucideIcon } from "lucide-react"
import { useStudentPortal } from "@/components/student-portal-context"
import type { Payment } from "@/lib/payment-types"
import { arePaymentsSettled, isApplicationAccepted, isOrientationComplete } from "@/lib/student-journey-status"

type StepState = "done" | "current" | "upcoming" | "unknown" | "blocked" | "soon"
type JourneySummary = {
  orientationPercent: number
  admitted: { university: string; program: string; status: string }[]
  decisions: { university: string; program: string; status: string }[]
  applicationsCount: number
  visaStatus: string
  scholarshipStatus: string
}

function hasDocument(value: unknown): boolean {
  return Array.isArray(value) ? value.length > 0 : typeof value === "string" && !!value.trim() && value.trim() !== "—"
}

const stateLabels: Record<StepState, string> = { done: "Terminé", current: "En cours", upcoming: "À venir", unknown: "À confirmer", blocked: "À revoir", soon: "À venir" }
type VisualState = StepState | "due" | "overdue"
const stateStyles: Record<VisualState, { icon: string; chip: string; number: string }> = {
  done: { icon: "border-emerald-50 bg-emerald-600 text-white", chip: "bg-emerald-100 text-emerald-800", number: "text-emerald-700" },
  current: { icon: "border-blue-50 bg-blue-600 text-white ring-4 ring-blue-100", chip: "bg-blue-100 text-blue-700", number: "text-blue-600" },
  due: { icon: "border-amber-50 bg-amber-500 text-amber-950 ring-4 ring-amber-100", chip: "bg-amber-100 text-amber-900", number: "text-amber-700" },
  overdue: { icon: "border-red-50 bg-red-600 text-white ring-4 ring-red-100", chip: "bg-red-100 text-red-800", number: "text-red-700" },
  blocked: { icon: "border-red-50 bg-red-600 text-white", chip: "bg-red-100 text-red-800", number: "text-red-700" },
  unknown: { icon: "border-amber-50 bg-amber-100 text-amber-800", chip: "bg-amber-100 text-amber-900", number: "text-amber-700" },
  upcoming: { icon: "border-slate-50 bg-slate-100 text-slate-500", chip: "bg-slate-100 text-slate-500", number: "text-slate-500" },
  soon: { icon: "border-slate-50 bg-slate-100 text-slate-500", chip: "bg-slate-100 text-slate-500", number: "text-slate-500" },
}

export default function StudentJourneyTimeline({ summary, payments, summaryError, paymentError, loading }: {
  summary: JourneySummary | null; payments: Payment[] | null; summaryError: boolean; paymentError: boolean; loading: boolean
}) {
  const { studentInfo } = useStudentPortal()
  const admission = studentInfo.admission
  const orientationDone = !summaryError && isOrientationComplete(summary?.orientationPercent)
  const paymentDone = !paymentError && arePaymentsSettled(payments)
  const admissionDone = !!summary?.admitted?.length || !!summary?.decisions?.some(decision => isApplicationAccepted(decision.status))
  const admissionRejected = !!summary?.decisions?.length && summary.decisions.every(decision => ["rejected", "refused", "refusé"].includes(decision.status.trim().toLowerCase()))
  const steps: { label: string; icon: LucideIcon; state: StepState }[] = [
    { label: "Orientation", icon: Users, state: summaryError || !summary ? "unknown" : orientationDone ? "done" : "current" },
    { label: "Paiement", icon: CreditCard, state: paymentError || payments === null ? "unknown" : paymentDone ? "done" : "current" },
    { label: "Documents", icon: FolderOpen, state: summaryError || !summary ? "unknown" : summary.applicationsCount > 0 || admissionDone ? "done" : paymentDone || hasDocument(admission?.admissionFolderDocuments) ? "current" : "upcoming" },
    { label: "Admission", icon: Landmark, state: summaryError || !summary ? "unknown" : admissionDone ? "done" : admissionRejected ? "blocked" : summary.applicationsCount > 0 ? "current" : "upcoming" },
    { label: "Bourse", icon: GraduationCap, state: "soon" },
    { label: "Visa", icon: BookUser, state: "soon" },
    { label: "Installation", icon: Plane, state: "soon" },
  ]

  const completed = steps.filter(step => step.state === "done").length

  return <section aria-labelledby="student-journey-heading" className="rounded-2xl border border-[#BCD6EC] bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <h2 id="student-journey-heading" className="text-xl font-semibold tracking-tight text-[#092C51] sm:text-2xl">Mon parcours</h2>
      <p className="text-sm text-slate-600 sm:text-base">
        {loading ? "Progression en cours de chargement…" : `${completed} étape${completed > 1 ? "s" : ""} sur ${steps.length} terminée${completed > 1 ? "s" : ""}`}
      </p>
    </div>
    <ol className="mt-6 grid grid-cols-1 gap-0 xl:grid-cols-7" aria-busy={loading}>
      {steps.map(({ label, icon: Icon, state }, index) => {
        const visualState: VisualState = label === "Paiement" && state === "current" ? payments?.some(payment => payment.status === "overdue") ? "overdue" : "due" : state
        const colors = stateStyles[visualState]
        const chipLabel = visualState === "overdue" ? "En retard" : visualState === "due" ? "À régler" : stateLabels[state]
        return <li key={label} aria-current={state === "current" ? "step" : undefined} className="relative flex min-w-0 items-center gap-4 pb-6 last:pb-0 xl:flex-col xl:gap-0 xl:pb-0 xl:text-center">
          {label === "Orientation" && <Link href="/student_italy/orientation" aria-label="Consulter ma fiche d’orientation" className="absolute inset-0 z-20 rounded-xl transition-colors hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4" />}
          {label === "Documents" && <Link href="/student_italy/documents" aria-label="Consulter mes documents" className="absolute inset-0 z-20 rounded-xl transition-colors hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4" />}
          {label === "Admission" && <Link href="/student_italy/admission" aria-label="Consulter mes candidatures" className="absolute inset-0 z-20 rounded-xl transition-colors hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4" />}
          {label === "Paiement" && <Link href="/student_italy/paiement" aria-label="Consulter mes paiements" className="absolute inset-0 z-20 rounded-xl transition-colors hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4" />}
          {index < steps.length - 1 && <span aria-hidden="true" className={"absolute left-[31px] top-16 h-[calc(100%-4rem)] border-l-2 xl:left-1/2 xl:top-[74px] 2xl:top-[80px] xl:h-0 xl:w-full xl:border-l-0 xl:border-t-2 " + (state === "done" ? "border-emerald-500" : "border-dashed border-slate-200")} />}
          <span className={"hidden text-sm font-semibold xl:mb-4 xl:block " + colors.number}>{String(index + 1).padStart(2, "0")}</span>
          <span className={"relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[7px] xl:h-[76px] xl:w-[76px] 2xl:h-[88px] 2xl:w-[88px] " + colors.icon}>
            <Icon className="h-6 w-6 xl:h-7 xl:w-7" strokeWidth={1.8} aria-hidden="true" />
            {state === "done" && <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /></span>}
          </span>
          <div className="min-w-0 xl:mt-4">
            <p className="text-sm font-semibold text-[#173B65] xl:px-1 2xl:text-base"><span className="mr-2 text-xs text-slate-400 xl:hidden">{String(index + 1).padStart(2, "0")}</span>{label}</p>
            <span className={"mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium " + (loading && state !== "soon" ? "bg-slate-100 text-slate-500" : colors.chip)}>{loading && state !== "soon" ? "Chargement…" : chipLabel}</span>
          </div>
        </li>
      })}
    </ol>
    {(summaryError || paymentError) && <p className="mt-5 text-xs text-amber-800">Certaines étapes restent à confirmer : leurs données sont momentanément indisponibles.</p>}
  </section>
}
