"use client"
import StudentAccountsDetails, { type StudentAccountsData } from "@/components/student-accounts-details"
import { languageOptions, type LanguageProof } from "@/lib/language-proofs"
import StudentLanguageDetails from "@/components/student-language-details"
import StudentAdmissionDossier from "@/components/student-admission-dossier"
import StudentRequestedDocuments from "@/components/student-requested-documents"
import StudentOriginalDocuments from "@/components/student-original-documents"
import StudentContract from "@/components/student-contract"
import StudentProposalDetails from "@/components/student-proposal-details"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, FileSignature, FolderOpen, GraduationCap, Languages, CheckCircle, Eye, Upload, Mail } from "lucide-react"
import ViewApplications from "@/components/view-applications"

const DOCUMENT_SUBMISSION_FORM_URL = "https://airtable.com/appkqvTuc8F0AhWPp/pag7uq3j4JejxC28v/form"

export interface FileAttachment {
  id: string
  url: string
  filename: string
  size?: number
  type?: string
}

export interface AdmissionData {
  // Bloc 1 - Proposal
  proposalDocument?: string | string[] | FileAttachment[]
  contractDocument?: string | string[] | FileAttachment[]
  proposalStatus?: string | string[]
  // Bloc 2 - Paiement
  upfrontPaiement?: string | string[]
  finalPaiement?: string | string[]
  // Bloc 3 - Documents
  admissionFolderDocuments?: string
  documentEvaluation?: string | string[]
  translation?: string | string[]
  declarationOfValue?: string | string[]
  originalAdmissionDocuments?: FileAttachment[]
  requestedDocuments?: string
  languageCertificate?: string | string[] | FileAttachment[]
  formulaireDossierOriginal?: string | string[]
  // Étapes (à lier précisément aux champs Airtable)
  dossierOriginal?: string | string[]
  traduction?: string | string[]
  dossierTraduit?: string | string[]
  decisionAdmission?: string | string[]
  validationUniversitaly?: string | string[]
  // Bloc 4 - Requirement
  emailForApplication?: string
  accountUniversitaly?: string | string[]
  accountPrenotami?: string | string[]
  // Bloc 5 - Application
  applicationUniversity?: string | string[]
  // Legacy fields (for backward compatibility)
  proposal?: string | string[]
  paymentFirstRate?: string | string[]
  application?: string | string[]
  admissionPayment?: string | string[]
  paymentAcceptanceFees?: string | string[]
}

interface AdmissionDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admissionData?: AdmissionData
  prospectId?: string
}

interface BlockData {
  id: string
  title: string
  icon: React.ReactNode
  mainField: string | string[] | undefined
  fields: Array<{
    label: string
    value: string | string[] | FileAttachment[] | undefined
  }>
}

interface DossierOriginalInfo {
  requiredDocuments: string
  commentaire: string
  evaluationDossier: string
  statutDossier: string
}

// Helper function to check if value is file attachment
const isFileAttachment = (value: any): value is FileAttachment[] => {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'url' in value[0] && 'filename' in value[0]
}

// Helper function to format values
const formatValue = (value: string | string[] | FileAttachment[] | undefined): string => {
  if (!value) return "—"
  if (isFileAttachment(value)) {
    return value.map(file => file.filename).join(", ") || "—"
  }
  if (Array.isArray(value)) {
    return value.filter(v => v && String(v).trim() !== "").join(", ") || "—"
  }
  return String(value).trim() || "—"
}

type FieldValue = string | string[] | FileAttachment[] | undefined

// Helper function to check if a value is completed
const isCompleted = (value: FieldValue): boolean => {
  const strValue = formatValue(value).toLowerCase()
  if (!value || strValue === "—") return false
  return (
    strValue.includes("accepted") ||
    strValue.includes("paid") ||
    strValue.includes("done") ||
    strValue.includes("completed") ||
    strValue.includes("signed") ||
    strValue.includes("exonerated")
  )
}

// Helper function to check if a value is in progress
const isInProgress = (value: FieldValue): boolean => {
  const strValue = formatValue(value).toLowerCase()
  if (!value || strValue === "—") return false
  return (
    strValue.includes("in progress") ||
    strValue.includes("in-progress") ||
    strValue.includes("in review") ||
    strValue.includes("in-review") ||
    strValue.includes("sent") ||
    strValue.includes("submitted") ||
    strValue.includes("booked") ||
    strValue.includes("cimea")
  )
}

// Helper function to check if a value has any data
const hasValue = (value: FieldValue): boolean => {
  return value !== undefined && value !== null && formatValue(value) !== "—"
}

// Helper function to determine status badge
const getStatusBadge = (value: FieldValue): { text: string; className: string } => {
  const strValue = formatValue(value).toLowerCase()

  if (!value || strValue === "—") {
    return { text: "Manquant", className: "bg-gray-500/20 text-gray-700 dark:text-gray-400" }
  }

  // Check for completed/positive statuses
  if (isCompleted(value)) {
    return { text: "Complété", className: "bg-green-500/20 text-green-700 dark:text-green-400" }
  }

  // Check for in-progress statuses
  if (isInProgress(value)) {
    return { text: "En cours", className: "bg-blue-500/20 text-blue-700 dark:text-blue-400" }
  }

  // Check for rejected/negative statuses
  if (strValue.includes("rejected") || strValue.includes("refused")) {
    return { text: "Refusé", className: "bg-red-500/20 text-red-700 dark:text-red-400" }
  }

  // Check for not started
  if (strValue.includes("not started") || strValue.includes("not-prepared") || strValue === "no") {
    return { text: "Non commencé", className: "bg-gray-500/20 text-gray-700 dark:text-gray-400" }
  }

  // Default: has value but status unclear
  return { text: "En cours", className: "bg-blue-500/20 text-blue-700 dark:text-blue-400" }
}

/** Proposal : une seule étape = présence du document de fiche d’orientation. */
function proposalDocumentPresent(admissionData: AdmissionData): boolean {
  return hasValue(admissionData.proposalDocument)
}

function proposalStepBadge(admissionData: AdmissionData): { text: string; className: string } {
  if (proposalDocumentPresent(admissionData)) {
    return { text: "Étape passée", className: "bg-green-500/20 text-green-700 dark:text-green-400" }
  }
  return { text: "Étape non passée", className: "bg-gray-500/20 text-gray-700 dark:text-gray-400" }
}

function contractDocumentPresent(admissionData: AdmissionData): boolean {
  return hasValue(admissionData.contractDocument)
}

function reglementStepBadge(admissionData: AdmissionData): { text: string; className: string } {
  if (contractDocumentPresent(admissionData)) {
    return { text: "Étape passée", className: "bg-green-500/20 text-green-700 dark:text-green-400" }
  }
  return { text: "Étape non passée", className: "bg-gray-500/20 text-gray-700 dark:text-gray-400" }
}

/** Pièce jointe = considéré comme reçu (vert). */
function languageCertificateIsFileAttachment(value: FieldValue): boolean {
  return Boolean(value && isFileAttachment(value))
}

function languageCertificateInProgressText(value: FieldValue): boolean {
  if (!hasValue(value) || languageCertificateIsFileAttachment(value)) return false
  if (isInProgress(value)) return true
  const s = formatValue(value).toLowerCase()
  return (
    s.includes("en cours") ||
    s.includes("pending") ||
    s.includes("attente") ||
    s.includes("waiting") ||
    s.includes("processing") ||
    s.includes("in corso")
  )
}

/** Vide → rouge ; en cours → jaune ; fichier ou autre valeur renseignée → vert. */
function languageCertificateTraffic(value: FieldValue): "green" | "yellow" | "red" {
  if (!hasValue(value)) return "red"
  if (languageCertificateIsFileAttachment(value)) return "green"
  const s = formatValue(value).toLowerCase()
  if (s.includes("not started") || s.includes("non commencé") || s === "no" || s === "non" || s.includes("pas encore")) {
    return "red"
  }
  if (languageCertificateInProgressText(value)) return "yellow"
  return "green"
}

function languageCertificateStepBadge(value: FieldValue): { text: string; className: string } {
  const t = languageCertificateTraffic(value)
  if (t === "red") {
    return { text: "Non renseigné", className: "bg-red-500/15 text-red-800 dark:text-red-300" }
  }
  if (t === "yellow") {
    return { text: "En cours", className: "bg-yellow-500/20 text-yellow-900 dark:text-yellow-200" }
  }
  return { text: "Reçu", className: "bg-green-500/20 text-green-700 dark:text-green-400" }
}

/** Pour métriques profil : étape comptée « faite » seulement si statut vert (reçu / validé). */
export function isLanguageCertificateComplete(value: unknown): boolean {
  return languageCertificateTraffic(value as FieldValue) === "green"
}

// Helper function to determine timeline icon color for a block
const getTimelineIconColor = (block: BlockData, admissionData: AdmissionData): "green" | "yellow" | "red" => {
  if (block.id === "proposal") {
    return proposalDocumentPresent(admissionData) ? "green" : "red"
  }
  if (block.id === "reglement") {
    return contractDocumentPresent(admissionData) ? "green" : "red"
  }
  if (block.id === "languageCertificate") {
    return languageCertificateTraffic(admissionData.languageCertificate)
  }

  const fieldsWithValues = block.fields.filter(field => hasValue(field.value))
  const completedFields = block.fields.filter(field => isCompleted(field.value))
  const inProgressFields = block.fields.filter(field => isInProgress(field.value))

  // If no fields have values, return red
  if (fieldsWithValues.length === 0) {
    return "red"
  }

  // If all fields with values are completed, return green
  if (completedFields.length === fieldsWithValues.length && completedFields.length > 0) {
    return "green"
  }

  // If some fields are completed or in progress, return yellow
  if (completedFields.length > 0 || inProgressFields.length > 0 || fieldsWithValues.length > 0) {
    return "yellow"
  }

  // Default to red if nothing is done
  return "red"
}

function buildAdmissionBlocks(admissionData: AdmissionData): BlockData[] {
  const dossierOriginalValue = admissionData.dossierOriginal ?? admissionData.admissionFolderDocuments
  const decisionAdmissionValue = admissionData.decisionAdmission ?? admissionData.applicationUniversity
  const validationUniversitalyValue = admissionData.validationUniversitaly ?? admissionData.accountUniversitaly

  return [
    {
      id: "proposal",
      title: "Fiche d’orientation",
      icon: <FileText className="w-6 h-6" />,
      mainField: undefined,
      fields: [{ label: "Document de fiche d’orientation", value: admissionData.proposalDocument }],
    },
    {
      id: "reglement",
      title: "Règlement",
      icon: <FileSignature className="w-6 h-6" />,
      mainField: undefined,
      fields: [
        { label: "Contrat", value: admissionData.contractDocument },

      ],
    },
    {
      id: "requestedDocuments",
      title: "Documents demandés",
      icon: <FileText className="w-6 h-6" />,
      mainField: admissionData.requestedDocuments,
      fields: [{ label: "Documents demandés", value: admissionData.requestedDocuments }],
    },
    {
      id: "applicationEmail",
      title: "Comptes de candidature",
      icon: <Mail className="w-6 h-6" />,
      mainField: admissionData.emailForApplication,
      fields: [{ label: "Adresse e-mail de candidature", value: admissionData.emailForApplication }],
    },
    {
      id: "languageCertificate",
      title: "Justificatifs de langue",
      icon: <Languages className="w-6 h-6" />,
      mainField: undefined,
      fields: [{ label: "Certificat de langue", value: admissionData.languageCertificate }],
    },
    {
      id: "dossierOriginal",
      title: "Dossier Original",
      icon: <FolderOpen className="w-6 h-6" />,
      mainField: dossierOriginalValue,
      fields: [{ label: "Dossier Original", value: dossierOriginalValue }],
    },
    {
      id: "dossierTraduit",
      title: "Dossier Traduit",
      icon: <FolderOpen className="w-6 h-6" />,
      mainField: admissionData.dossierTraduit,
      fields: [{ label: "Dossier Traduit", value: admissionData.dossierTraduit }],
    },
    {
      id: "application",
      title: "Candidature",
      icon: <GraduationCap className="w-6 h-6" />,
      mainField: admissionData.applicationUniversity || admissionData.application,
      fields: [],
    },
    {
      id: "decisionAdmission",
      title: "Décision d'admission",
      icon: <CheckCircle className="w-6 h-6" />,
      mainField: decisionAdmissionValue,
      fields: [{ label: "Décision d'admission", value: decisionAdmissionValue }],
    },
    {
      id: "validationUniversitaly",
      title: "Validation Universitaly",
      icon: <CheckCircle className="w-6 h-6" />,
      mainField: validationUniversitalyValue,
      fields: [{ label: "Validation Universitaly", value: validationUniversitalyValue }],
    },
  ]
}

/** Same timeline + cards as the admission dialog, for use on `/student_italy/admission`. */
export function AdmissionDetailsContent({
  admissionData,
  prospectId,
  contratSigned = false,
  studentEmail,
  summaryOnly = false,
}: {
  admissionData?: AdmissionData
  prospectId?: string
  contratSigned?: boolean
  studentEmail?: string
  summaryOnly?: boolean
}) {
  const [candidaturesOpen, setCandidaturesOpen] = useState(false)
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null)
  const [dossierOriginalInfo, setDossierOriginalInfo] = useState<DossierOriginalInfo | null>(null)
  const [selectedStep, setSelectedStep] = useState(0)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [languageProofs, setLanguageProofs] = useState<LanguageProof[] | null>(null)
  const [languageError, setLanguageError] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    if (!prospectId || !studentEmail || detailsOpen) return
    setLanguageError(false)
    fetch("/api/student-language?" + new URLSearchParams({ email: studentEmail, folderId: prospectId }), { signal: controller.signal })
      .then(async res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => setLanguageProofs(data.proofs))
      .catch(() => { if (!controller.signal.aborted) setLanguageError(true) })
    return () => controller.abort()
  }, [prospectId, studentEmail, detailsOpen])
  const [accountsData, setAccountsData] = useState<StudentAccountsData | null>(null)
  const [accountsError, setAccountsError] = useState(false)
  useEffect(() => {
    let cancelled = false
    setAccountsData(null); setAccountsError(false)
    if (!prospectId) return
    fetch("/api/student-accounts?prospectId=" + encodeURIComponent(prospectId))
      .then(async res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => { if (!cancelled) setAccountsData(data) })
      .catch(() => { if (!cancelled) setAccountsError(true) })
    return () => { cancelled = true }
  }, [prospectId])
  const [proposalPercent, setProposalPercent] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    setProposalPercent(null)
    if (!prospectId) return
    fetch("/api/proposal-details?prospectId=" + encodeURIComponent(prospectId))
      .then(async res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => { if (!cancelled && typeof data.percent === "number") setProposalPercent(data.percent) })
      .catch(() => { if (!cancelled) setProposalPercent(null) })
    return () => { cancelled = true }
  }, [prospectId])


  useEffect(() => {
    if (!prospectId) {
      setApplicationsCount(null)
      return
    }

    let cancelled = false
    fetch("/api/get-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectId }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { success?: boolean; applications?: unknown[] }
        if (cancelled || !res.ok || !data.success) return
        const count = Array.isArray(data.applications) ? data.applications.length : 0
        if (!cancelled) setApplicationsCount(count)
      })
      .catch(() => {
        if (!cancelled) setApplicationsCount(null)
      })

    return () => {
      cancelled = true
    }
  }, [prospectId])

  useEffect(() => {
    if (!prospectId) {
      setDossierOriginalInfo(null)
      return
    }
    let cancelled = false
    fetch("/api/dossier-original", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectId }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { success?: boolean; dossierOriginal?: DossierOriginalInfo | null }
        if (cancelled || !res.ok || !data.success) return
        if (!cancelled) setDossierOriginalInfo(data.dossierOriginal ?? null)
      })
      .catch(() => {
        if (!cancelled) setDossierOriginalInfo(null)
      })
    return () => {
      cancelled = true
    }
  }, [prospectId])

  if (!admissionData) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">Aucun détail d&apos;admission disponible pour le moment.</p>
      </div>
    )
  }

  const blocks = buildAdmissionBlocks(admissionData)

  const getBlockTraffic = (block: BlockData): "green" | "yellow" | "red" => {
    if (block.id === "requestedDocuments") return admissionData.requestedDocuments?.trim() ? "green" : "red"
    if (block.id === "applicationEmail") return (accountsData?.applicationEmail || admissionData.emailForApplication)?.trim() ? "green" : "red"
    if (block.id === "reglement" && contratSigned) return "green"
    if (block.id === "proposal") return proposalPercent !== null && proposalPercent > 60 ? "green" : proposalPercent !== null && proposalPercent > 0 ? "yellow" : "red"
    if (block.id === "dossierOriginal") {
      const statut = dossierOriginalInfo?.statutDossier?.trim().toLowerCase() ?? ""
      if (statut === "complet" || statut === "complete" || statut === "completed") {
        return "green"
      }
    }
    if (block.id === "application") {
      if ((applicationsCount ?? 0) > 0) {
        return "green"
      }
    }
    return getTimelineIconColor(block, admissionData)
  }

  const stepStates = blocks.map((b) => getBlockTraffic(b))
  const totalSteps = Math.max(1, blocks.length)
  const completedCount = stepStates.filter((s) => s === "green").length
  const inProgressCount = stepStates.filter((s) => s === "yellow").length
  const weightedDone = completedCount + inProgressCount * 0.5
  const progressPct = Math.round((weightedDone / totalSteps) * 100)
  const firstIncomplete = stepStates.findIndex((s) => s !== "green")
  const currentStep = firstIncomplete === -1 ? blocks.length - 1 : firstIncomplete
  const safeSelectedStep = Math.min(selectedStep, Math.max(0, blocks.length - 1))
  const selectedBlock = blocks[safeSelectedStep] ?? blocks[0]
  const dossierOriginalFormUrl = (() => {
    const raw = admissionData.formulaireDossierOriginal
    if (Array.isArray(raw)) {
      const first = raw.find((v) => typeof v === "string" && v.trim().length > 0)
      return first ? String(first).trim() : DOCUMENT_SUBMISSION_FORM_URL
    }
    if (typeof raw === "string" && raw.trim().length > 0) return raw.trim()
    return DOCUMENT_SUBMISSION_FORM_URL
  })()


  const getStepPreview = (block: BlockData): string => {
    if (block.id === "application") {
      return applicationsCount === null ? "Candidatures non chargées" : `${applicationsCount} candidature(s)`
    }

    if (block.id === "dossierOriginal") {
      const count = admissionData.originalAdmissionDocuments?.length ?? 0
      if (count) return `${count} document(s) original(aux) ajouté(s)`
      const s = dossierOriginalInfo?.statutDossier?.trim()
      return s ? `Statut de dossier: ${s}` : "Statut de dossier non disponible"
    }
    const firstField = block.fields.find((f) => formatValue(f.value) !== "—")
    if (!firstField) return "Information manquante"
    const value = formatValue(firstField.value)
    return value.length > 60 ? `${value.slice(0, 57)}...` : value
  }

  if (summaryOnly) {
    return <div className="mt-4 border-t border-zinc-100 pt-3">
      <div className="mb-2 flex items-center justify-between text-xs"><span className="text-zinc-500">Avancement de l’admission</span><span className="font-semibold text-zinc-900">{progressPct}%</span></div>
      <div role="progressbar" aria-label="Avancement de l’admission" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: progressPct + "%" }} /></div>
      <p className="mt-2 text-xs text-zinc-500">{completedCount}/{totalSteps} étapes complétées</p>
    </div>
  }

  return (
    <TooltipProvider delayDuration={200}>
      <>
      <Card className="border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Calendrier d&apos;admission</p>
            <p className="text-sm font-semibold text-zinc-900">
              {completedCount}/{blocks.length} étapes complétées
            </p>
          </div>
          <div className="w-full max-w-[240px]">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span>Progression</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full rounded-full bg-[var(--jx-terracotta)]" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="relative">
          <ol className="space-y-3">
            {blocks.map((block, index) => {
              const candidatureCard = block.id === "application"
              const decisionCard = block.id === "decisionAdmission" || block.id === "validationUniversitaly"
              const originalDocumentsCard = block.id === "dossierOriginal"
              const requestedDocumentsCard = block.id === "requestedDocuments"
              const languageCard = block.id === "languageCertificate"
              const mobileCardOpensDetails = ["proposal", "reglement", "applicationEmail", "dossierTraduit"].includes(block.id)
              const state = getBlockTraffic(block)
              const preview = block.id === "applicationEmail" ? (accountsData?.applicationEmail || admissionData.emailForApplication || "Comptes de candidature non renseignés") : block.id === "reglement" && contratSigned ? "Contrat signé" : block.id === "proposal" && proposalPercent !== null ? proposalPercent + "% des informations complétées" : getStepPreview(block)
              const isCurrent = index === currentStep
              const nodeClass =
                state === "green"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : state === "yellow"
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-zinc-400 bg-white text-zinc-500"

              return (
                <li key={block.id} className="relative pl-10">
                  {index < blocks.length - 1 ? (
                    <span className="absolute left-[17px] top-8 h-[calc(100%+8px)] w-px bg-zinc-200" aria-hidden />
                  ) : null}
                  <span
                    className={`absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-semibold ${nodeClass}`}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div
                    className={`@container/admission-step relative rounded-lg border px-3 py-2.5 sm:px-3.5 ${
                      isCurrent ? "border-[var(--jx-terracotta)]/40 bg-[#fff9f5]" : "border-zinc-200 bg-white"
                    }`}
                  >
                    {(mobileCardOpensDetails || languageCard || originalDocumentsCard || decisionCard || requestedDocumentsCard || candidatureCard) && <button type="button" aria-label={"Consulter " + block.title} aria-haspopup="dialog" onClick={() => { if (candidatureCard) { setCandidaturesOpen(true); return } setSelectedStep(index); setDetailsOpen(true) }} className={`absolute inset-0 z-10 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jx-terracotta)] ${languageCard || decisionCard || requestedDocumentsCard ? "" : "md:hidden"}`} />}
                    <div className="flex min-w-0 flex-col gap-2.5 @[560px]/admission-step:flex-row @[560px]/admission-step:items-start @[560px]/admission-step:gap-2">
                      <div className="min-w-0 w-full @[560px]/admission-step:flex-1">
                        <p className="break-words text-xs font-semibold text-zinc-900">{block.title}</p>
                        {languageCard && studentEmail ? <div className="mt-1 space-y-1 text-xs text-zinc-500">{languageError ? <p>Justificatifs indisponibles — cliquez pour réessayer</p> : languageProofs === null ? <p>Chargement des justificatifs…</p> : languageProofs.length ? languageProofs.map(proof => <p key={proof.id} className="break-words"><span className="font-medium text-zinc-700">{proof.language === "italian" ? "Italien" : "Anglais"} · {proof.type === "ef_legacy" ? "EF SET" : languageOptions.find(o => o.id === proof.type)?.label ?? proof.type}</span>{proof.score ? " — " + proof.score + (proof.type.startsWith("ef") ? "/100" : proof.type === "ielts" ? "/9" : "") : languageOptions.find(o => o.id === proof.type)?.studies ? (proof.documents.length ? " — document déposé" : " — à compléter") : " — score non renseigné"}</p>) : <p>Aucun justificatif ajouté</p>}</div> : <p className={requestedDocumentsCard ? "mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-600" : "mt-0.5 line-clamp-2 text-xs text-zinc-500 @[560px]/admission-step:truncate"}>{requestedDocumentsCard ? admissionData.requestedDocuments?.trim() ? "Consulter les documents demandés" : "Aucun document demandé pour le moment." : preview}</p>}
                      </div>
                      <div className={`flex w-full min-w-0 flex-row flex-wrap items-center justify-end gap-1.5 @[560px]/admission-step:ml-auto @[560px]/admission-step:w-auto @[560px]/admission-step:shrink-0 @[560px]/admission-step:gap-2 ${languageCard || requestedDocumentsCard || decisionCard ? "hidden" : mobileCardOpensDetails || originalDocumentsCard || candidatureCard ? "hidden md:flex" : ""}`}>
                        {block.id === "application" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={!prospectId ? "inline-flex cursor-not-allowed" : "inline-flex"}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 min-w-9 shrink-0 justify-center gap-0 border-blue-300 bg-blue-50 p-0 text-blue-700 hover:bg-blue-100 hover:text-blue-800 @[560px]/admission-step:h-7 @[560px]/admission-step:w-auto @[560px]/admission-step:min-w-0 @[560px]/admission-step:gap-1.5 @[560px]/admission-step:px-2.5"
                                  disabled={!prospectId}
                                  aria-label="Afficher mes candidatures"
                                  onClick={() => setCandidaturesOpen(true)}
                                >
                                  <Eye className="h-4 w-4 shrink-0 @[560px]/admission-step:mr-1 @[560px]/admission-step:h-3.5 @[560px]/admission-step:w-3.5" />
                                  <span className="sr-only @[560px]/admission-step:not-sr-only @[560px]/admission-step:inline">
                                    Afficher mes candidatures
                                  </span>
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">Afficher mes candidatures</TooltipContent>
                          </Tooltip>
                        ) : null}
                        {(block.id === "dossierOriginal" || block.id === "dossierTraduit") ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 min-w-9 shrink-0 justify-center gap-0 border-emerald-300 bg-emerald-50 p-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 @[560px]/admission-step:h-7 @[560px]/admission-step:w-auto @[560px]/admission-step:min-w-0 @[560px]/admission-step:gap-1.5 @[560px]/admission-step:px-2.5"
                                aria-label="Soumettre mes documents"
                                onClick={() => {
                                  if (block.id === "dossierOriginal" || block.id === "dossierTraduit") { setSelectedStep(index); setDetailsOpen(true); return }
                                  if (typeof window !== "undefined") {
                                    const urlToOpen =
                                      block.id === "dossierOriginal" ? dossierOriginalFormUrl : DOCUMENT_SUBMISSION_FORM_URL
                                    window.open(urlToOpen, "_blank", "noopener,noreferrer")
                                  }
                                }}
                              >
                                <Upload className="h-4 w-4 shrink-0 @[560px]/admission-step:mr-1 @[560px]/admission-step:h-3.5 @[560px]/admission-step:w-3.5" />
                                <span className="sr-only @[560px]/admission-step:not-sr-only @[560px]/admission-step:inline">
                                  Soumettre mes documents
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Soumettre mes documents</TooltipContent>
                          </Tooltip>
                        ) : null}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-9 w-9 min-w-9 shrink-0 justify-center gap-0 border-[var(--jx-terracotta)]/40 bg-[var(--jx-terracotta)] p-0 text-white hover:bg-[var(--jx-terracotta)]/90 hover:text-white @[560px]/admission-step:h-7 @[560px]/admission-step:w-auto @[560px]/admission-step:min-w-0 @[560px]/admission-step:gap-1.5 @[560px]/admission-step:px-2.5 ${originalDocumentsCard || candidatureCard ? "hidden" : mobileCardOpensDetails ? "hidden md:inline-flex" : ""}`}
                              aria-label="Détail"
                              onClick={() => {
                                setSelectedStep(index)
                                setDetailsOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 shrink-0 @[560px]/admission-step:mr-1 @[560px]/admission-step:h-3.5 @[560px]/admission-step:w-3.5" />
                              <span className="sr-only @[560px]/admission-step:not-sr-only @[560px]/admission-step:inline">Détail</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Détail</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </Card>



      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Étape {safeSelectedStep + 1} · {selectedBlock.title}</DialogTitle>
            <DialogDescription>Détails complets de cette étape</DialogDescription>
          </DialogHeader>

          {selectedBlock.id === "proposal" ? (
            <StudentProposalDetails prospectId={prospectId} />
          ) : selectedBlock.id === "requestedDocuments" ? (
            <StudentRequestedDocuments text={admissionData.requestedDocuments} />
          ) : selectedBlock.id === "dossierTraduit" ? (
            <StudentAdmissionDossier />
          ) : selectedBlock.id === "languageCertificate" ? (
            <StudentLanguageDetails certificate={admissionData.languageCertificate} />
          ) : selectedBlock.id === "applicationEmail" ? (
            <StudentAccountsDetails data={accountsData} error={accountsError} />
          ) : selectedBlock.id === "reglement" ? (
            <StudentContract />
          ) : selectedBlock.id === "application" ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">Consultez vos candidatures pour voir université, formation et statut.</p>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
                <span className="font-medium text-zinc-500">Nombre de candidatures: </span>
                <span className="font-semibold text-zinc-900">{applicationsCount === null ? "—" : applicationsCount}</span>
              </div>
            </div>
          ) : selectedBlock.id === "dossierOriginal" ? (
            <StudentOriginalDocuments />
          ) : (
            <div className="space-y-2">
              {selectedBlock.fields.map((field, index) => {
                const fieldValue = formatValue(field.value)
                const isFileField =
                  (field.label === "Proposal Document" ||
                    field.label === "Contrat" ||
                    field.label === "Language Certificate") &&
                  isFileAttachment(field.value)

                return (
                  <div key={index} className="rounded-md border border-zinc-200 bg-zinc-50/70 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{field.label}</p>
                    {isFileField && field.value ? (
                      <div className="mt-1.5 flex flex-col gap-1">
                        {(field.value as FileAttachment[]).map((file, fileIndex) => (
                          <a
                            key={file.id || fileIndex}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={file.filename}
                            className="inline-flex items-center gap-2 text-sm text-[var(--jx-terracotta)] underline-offset-2 hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            <span>{file.filename}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className={`mt-1 text-sm ${fieldValue === "—" ? "italic text-zinc-500" : "text-zinc-900"}`}>{fieldValue}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {prospectId ? (
        <ViewApplications
          open={candidaturesOpen}
          onOpenChange={setCandidaturesOpen}
          prospectId={prospectId}
        />
      ) : null}
      </>
    </TooltipProvider>
  )
}

export default function AdmissionDetails({ open, onOpenChange, admissionData, prospectId }: AdmissionDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Détails d&apos;admission</DialogTitle>
          <DialogDescription>Suivez toutes les étapes de votre processus d&apos;admission</DialogDescription>
        </DialogHeader>
        <AdmissionDetailsContent admissionData={admissionData} prospectId={prospectId} />
      </DialogContent>
    </Dialog>
  )
}
