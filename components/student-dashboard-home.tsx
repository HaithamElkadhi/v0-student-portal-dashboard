"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, ClipboardList, Plane, GraduationCap, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStudentPortal, type PortalAdmissionData } from "@/components/student-portal-context"
import { isLanguageCertificateComplete } from "@/components/admission-details"

const ADMISSION_ROUTE = "/student_italy/admission"
const ACCENT = "var(--jx-terracotta)"

function ItalyStripeBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-1 w-full overflow-hidden rounded-t-[inherit]", className)} aria-hidden>
      <div className="h-full flex-[1.15] bg-[#009246]" />
      <div className="h-full flex-1 bg-white" />
      <div className="h-full flex-[1.15] bg-[#CE2B37]" />
    </div>
  )
}

const COUNTRY_ALPHA2: Record<string, string> = {
  tunisia: "TN",
  tunisie: "TN",
  italy: "IT",
  italie: "IT",
  france: "FR",
  morocco: "MA",
  maroc: "MA",
  algeria: "DZ",
  algérie: "DZ",
  spain: "ES",
  espagne: "ES",
}

function coerceSingleLine(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return ""
    return coerceSingleLine(value[0])
  }
  if (typeof value === "object" && value !== null) {
    const o = value as Record<string, unknown>
    if (typeof o.name === "string") return o.name.trim()
    if (typeof o.value === "string") return o.value.trim()
  }
  return String(value).trim()
}

function regionBadge(citizenship?: unknown, residence?: unknown): string {
  const rawA = coerceSingleLine(citizenship)
  const rawB = coerceSingleLine(residence)
  const a = rawA.toLowerCase()
  const b = rawB.toLowerCase()
  const ca = a ? COUNTRY_ALPHA2[a] ?? rawA.slice(0, 2).toUpperCase() : "—"
  const rb = b ? COUNTRY_ALPHA2[b] ?? rawB.slice(0, 2).toUpperCase() : "—"
  if (ca === "—" && rb === "—") return "—"
  return `${ca} · ${rb}`.trim()
}

/** Contrat (fichier) — aligné avec l’étape Règlement côté admission. */
function contractStepDone(value: unknown): boolean {
  if (value == null) return false
  if (Array.isArray(value)) {
    if (value.length === 0) return false
    const first = value[0]
    if (first && typeof first === "object" && "url" in first && "filename" in first) return true
    return value.some((x) => x != null && String(x).trim() !== "")
  }
  return String(value).trim() !== ""
}

function initials(name: unknown, surname?: unknown): string {
  const n = coerceSingleLine(name)
  const s = coerceSingleLine(surname)
  const parts = n.split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? ""
  const b = s[0] ?? parts[1]?.[0] ?? ""
  return (a + b).toUpperCase() || n.slice(0, 2).toUpperCase() || "?"
}

function calculateAdmissionPercentage(admissionData?: PortalAdmissionData): number {
  if (!admissionData) return 0

  const steps = [
    {
      value: admissionData.proposal,
      isCompleted: (v: unknown) =>
        String(v || "")
          .toLowerCase()
          .includes("accepted") || String(v || "").toLowerCase().includes("signed"),
    },
    {
      value: admissionData.paymentFirstRate,
      isCompleted: (v: unknown) =>
        String(v || "")
          .toLowerCase()
          .includes("paid") || String(v || "").toLowerCase().includes("exonerated"),
    },
    {
      value: admissionData.contractDocument,
      isCompleted: (_v: unknown) => contractStepDone(admissionData.contractDocument),
    },
    {
      value: admissionData.languageCertificate,
      isCompleted: (_v: unknown) => isLanguageCertificateComplete(admissionData.languageCertificate),
    },
    { value: admissionData.emailForApplication, isCompleted: (v: unknown) => v && String(v).trim() !== "" },
    {
      value: admissionData.declarationOfValue,
      isCompleted: (v: unknown) => String(v || "").toLowerCase().includes("done"),
    },
    {
      value: admissionData.translation,
      isCompleted: (v: unknown) => String(v || "").toLowerCase().includes("done"),
    },
    {
      value: admissionData.admissionFolderDocuments,
      isCompleted: (v: unknown) => v && String(v).trim() !== "",
    },
    {
      value: admissionData.application,
      isCompleted: (v: unknown) => String(v || "").toLowerCase().includes("accepted"),
    },
    {
      value: admissionData.admissionPayment,
      isCompleted: (v: unknown) => String(v || "").toLowerCase().includes("paid"),
    },
  ]

  let completedCount = 0
  let startedCount = 0

  steps.forEach((step) => {
    const hasValue = Array.isArray(step.value)
      ? step.value.length > 0
      : step.value && String(step.value).trim() !== ""

    if (hasValue) {
      startedCount++
      const values = Array.isArray(step.value) ? step.value : [step.value]
      if (values.some((v) => step.isCompleted(v))) {
        completedCount++
      }
    }
  })

  if (startedCount === 0) return 0

  const totalSteps = steps.length
  const completedWeight = (completedCount / totalSteps) * 70
  const startedWeight = ((startedCount - completedCount) / totalSteps) * 30

  return Math.round(completedWeight + startedWeight)
}

function admissionSubtitle(pct: number): string {
  if (pct === 0) return "Constitution du dossier"
  if (pct < 40) return "Étapes initiales"
  if (pct < 70) return "En révision"
  if (pct < 100) return "Finalisation"
  return "Terminé"
}

function decisionColorClass(value: string): string {
  const normalized = value.toLowerCase()
  if (!normalized || normalized === "—") return "text-zinc-900"
  if (/accepted|admis|admission confirm|approved|valid/i.test(normalized)) return "text-emerald-600"
  if (/refused|rejected|denied|cancelled|canceled|declined/i.test(normalized)) return "text-rose-600"
  if (/pending|en cours|review|processing|waiting|attente/i.test(normalized)) return "text-amber-600"
  return "text-zinc-900"
}

function MetricCell({
  value,
  label,
  valueClassName,
}: {
  value: ReactNode
  label: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col justify-center px-3 py-3 sm:px-4 sm:py-3.5">
      <p className={cn("text-2xl font-semibold tabular-nums tracking-tight sm:text-[1.75rem]", valueClassName || "text-zinc-900")}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase leading-tight tracking-wide text-zinc-500">{label}</p>
    </div>
  )
}

export default function StudentDashboardHome() {
  const { studentInfo } = useStudentPortal()

  const admissionPct = calculateAdmissionPercentage(studentInfo.admission)
  const displayName = coerceSingleLine(studentInfo.name)
  const firstName = displayName.split(/\s+/)[0] || displayName

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    if (!hash) return
    const t = window.setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
    return () => clearTimeout(t)
  }, [])

  const passportValidity = coerceSingleLine(studentInfo.passportValidity) || "—"
  const applicationsCount = coerceSingleLine(studentInfo.numberApplications) || "—"
  const admissionDecision = coerceSingleLine(studentInfo.admission?.applicationUniversity) || "—"
  const admissionDecisionColor = decisionColorClass(admissionDecision)
  const badge = regionBadge(studentInfo.citizenship, studentInfo.countryOfResidence)

  const ini = initials(studentInfo.name, studentInfo.surname)
  const photoUrl =
    studentInfo.photo && Array.isArray(studentInfo.photo) && studentInfo.photo.length > 0
      ? (studentInfo.photo[0] as { url?: string; thumbnails?: { large?: { url?: string } } }).url ||
        (studentInfo.photo[0] as { thumbnails?: { large?: { url?: string } } }).thumbnails?.large?.url
      : typeof studentInfo.photo === "string"
        ? studentInfo.photo
        : null

  const scrollMainTop = "scroll-mt-20 md:scroll-mt-14"
  const denseLabel = "text-[9px] font-semibold uppercase tracking-wide text-zinc-400"
  const denseValue = "text-sm font-medium text-zinc-900"

  return (
    <>
      {/* Hero — avatar large, une seule touche de marque */}
      <Card
        id="accueil"
        className={cn(
          "mb-4 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          scrollMainTop,
        )}
      >
        <ItalyStripeBar />
        <div className="flex flex-col gap-4 bg-gradient-to-br from-white via-[#fcfbfa] to-[#f7f5f2] p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
          <div
            className="relative mx-auto shrink-0 sm:mx-0"
            style={{ width: "7.5rem", height: "7.5rem" }}
          >
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200/90"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-semibold tracking-tight text-zinc-500">{ini}</span>
              )}
            </div>
            <div
              className="pointer-events-none absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm"
              style={{ background: ACCENT }}
              title="Profil actif"
              aria-hidden
            />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">Bienvenue</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[1.65rem]">
              {firstName}
            </h1>
            <p className="mt-1 truncate text-sm text-zinc-500">{coerceSingleLine(studentInfo.email) || "—"}</p>
            <p
              className="mt-2 text-xs italic text-zinc-400/90"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Studiare in Italia — portail Jeexpert
            </p>
            {badge !== "—" ? (
              <p className="mt-3 inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs font-medium text-zinc-600">
                {badge}
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Stats — une carte, tons neutres uniquement */}
      <Card className="mb-4 divide-y divide-zinc-100 rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:divide-x sm:divide-y-0">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <MetricCell value={applicationsCount} label="Nombre applications" />
          <MetricCell value={admissionDecision} label="Décision admission" valueClassName={admissionDecisionColor} />
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <Card
          id="profil"
          className={cn(
            "rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5",
            scrollMainTop,
          )}
        >
          <p className="mb-3 border-l-[3px] border-[#009246] pl-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Informations personnelles
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Prénom</p>
              <p className={cn(denseValue, "truncate")}>{displayName || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Nom</p>
              <p className={cn(denseValue, "truncate")}>{coerceSingleLine(studentInfo.surname) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Genre</p>
              <p className={denseValue}>{coerceSingleLine(studentInfo.gender) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Date de naissance</p>
              <p className={denseValue}>
                {studentInfo.birthday ? new Date(String(studentInfo.birthday)).toLocaleDateString("fr-FR") : "—"}
              </p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Téléphone</p>
              <p className={cn(denseValue, "truncate")}>{coerceSingleLine(studentInfo.phone) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>WhatsApp</p>
              <p className={cn(denseValue, "truncate")}>{coerceSingleLine(studentInfo.whatsapp) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Nationalité</p>
              <p className={cn(denseValue, "truncate")}>{coerceSingleLine(studentInfo.citizenship) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Résidence</p>
              <p className={cn(denseValue, "truncate")}>{coerceSingleLine(studentInfo.countryOfResidence) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Validité passeport (mois)</p>
              <p className={cn(denseValue, "truncate")}>{passportValidity}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Adresse</p>
              <p className={cn(denseValue, "truncate")}>{coerceSingleLine(studentInfo.fullAddress) || "—"}</p>
            </div>
          </div>
        </Card>

        {/* Parcours — timeline verticale, accent unique */}
        <Card className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
          <p className="mb-4 border-l-[3px] border-[#009246] pl-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Parcours
          </p>
          <div className="relative pl-1">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-zinc-200" aria-hidden />

            <div className="relative pb-6">
              <span
                className="absolute left-0 top-1.5 z-[1] h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ background: ACCENT }}
                aria-hidden
              />
              <Link
                href={ADMISSION_ROUTE}
                className="ml-6 block rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                prefetch
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-zinc-500" aria-hidden />
                    <span className="text-sm font-semibold text-zinc-900">Admission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">En cours</span>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400" aria-hidden />
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{admissionSubtitle(admissionPct)}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-200/90">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${admissionPct}%`, background: ACCENT }}
                  />
                </div>
              </Link>
            </div>

            {(
              [
                { id: "visa", title: "Visa", icon: <Plane className="h-4 w-4" /> },
                { id: "scholarship", title: "Bourse", icon: <GraduationCap className="h-4 w-4" /> },
                { id: "integration", title: "Intégration", icon: <Globe className="h-4 w-4" /> },
              ] as const
            ).map((row, i, arr) => (
              <div key={row.id} id={row.id} className={cn("relative", i < arr.length - 1 ? "pb-5" : "pb-0")}>
                <span className="absolute left-0 top-1.5 z-[1] h-2.5 w-2.5 rounded-full border-2 border-white bg-zinc-300" aria-hidden />
                <div className="ml-6 flex items-center justify-between gap-2 rounded-xl border border-dashed border-zinc-200 bg-white/80 px-3 py-2.5">
                  <div className="flex items-center gap-2 text-zinc-600">
                    {row.icon}
                    <span className="text-sm font-medium text-zinc-800">{row.title}</span>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Bientôt</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
