"use client"

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
import { FileText, FileSignature, FolderOpen, GraduationCap, Languages, CheckCircle, Eye, Upload, BookOpen } from "lucide-react"
import ViewApplications from "@/components/view-applications"

const DOCUMENT_SUBMISSION_FORM_URL = "https://airtable.com/appkqvTuc8F0AhWPp/pag7uq3j4JejxC28v/form"

/** Texte par étape — à remplir quand le contenu sera fourni. */
const ADMISSION_STEP_INSTRUCTIONS: Partial<Record<string, string>> = {
  proposal: `Cette étape correspond à un rendez-vous de consultation et d’orientation avec notre équipe : il s’agit d’un échange en visioconférence en tête-à-tête (one-to-one), en ligne, dans lequel nous prenons le temps de comprendre votre parcours et vos objectifs.

Au cours de cet entretien, nous analysons votre profil académique et professionnel, recueillons vos préférences (ville, établissement, filière, calendrier, budget, etc.), puis nous répondons à toutes vos questions sur les études en Italie, les démarches et la suite du dossier.

C’est le moment idéal pour aligner vos attentes avec les options réelles et poser les bases d’une stratégie d’admission claire.

Pour prendre rendez-vous ou obtenir plus d’informations sur les disponibilités, contactez-nous au +39 352 088 0880.`,
  reglement: `Il s’agit du contrat qui encadre notre collaboration, notamment le droit d’utilisation de vos données personnelles dans le cadre de votre dossier (conformité et transparence).

C’est une étape simple : en général, vous recevez le document par e-mail ou par WhatsApp, vous le signez et nous le renvoyez comme indiqué.

Une fois le contrat validé de notre côté, vous retrouvez la version finale en téléchargement depuis votre espace (ou le lien communiqué par l’équipe).`,
  languageCertificate: `Les universités italiennes reconnaissent en général les certificats de langue suivants pour les formations en anglais (liste indicative — vérifiez toujours la fiche du programme choisi) :

• IELTS Academic
• TOEFL iBT (Internet-Based Test)
• Cambridge English : B2 First (FCE), C1 Advanced (CAE), C2 Proficiency (CPE)
• PTE Academic (Pearson)
• Trinity College London : ISE II / ISE III (selon programmes)

Si vous suivez ou préparez un cursus en italien, les certificats d’italien L2 les plus couramment acceptés sont :

• CILS (Certificazione di Italiano come Lingua Straniera — Università per Stranieri di Siena)
• CELI (Certificazione di conoscenza della lingua italiana — Università per Stranieri di Perugia)
• PLIDA (Progetto Lingua Italiana Dante Alighieri)
• Certificazione IT (Università Roma Tre)

Le niveau exigé (souvent B2 pour l’italien, scores minimaux pour l’anglais) et la liste exacte des preuves acceptées sont fixés par chaque université et chaque appel ; votre conseiller peut vous confirmer le bon examen et la date limite pour votre dossier.`,
  dossierOriginal: `Pour constituer votre dossier original, rassemblez notamment :

• votre CV à jour ;
• une pièce d’identité — de préférence le passeport (valide) ;
• vos relevés de notes depuis le bac, et tous vos diplômes depuis le baccalauréat (bac, études supérieures, autre formation reconnue) ;
• les certificats de formation ou d’expérience professionnelle dont vous disposez ;
• vos attestations ou certificats de langue.

Vous soumettez ces documents via le formulaire indiqué sur cette étape. Notre équipe les examine : après évaluation, nous vous communiquons la liste des pièces à faire traduire (étape « Traduction ») ainsi que, le cas échéant, la liste des documents manquants ou à compléter.`,
  traduction: "",
  dossierTraduit: "",
  application: "",
  decisionAdmission: "",
  validationUniversitaly: "",
}

function instructionBodyForStep(stepId: string): string {
  const custom = ADMISSION_STEP_INSTRUCTIONS[stepId]?.trim()
  if (custom) return custom
  return "Les instructions pour cette étape seront ajoutées prochainement."
}

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

/** Proposal : une seule étape = présence du document de proposition. */
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
  const traductionValue = admissionData.traduction ?? admissionData.translation
  const decisionAdmissionValue = admissionData.decisionAdmission ?? admissionData.applicationUniversity
  const validationUniversitalyValue = admissionData.validationUniversitaly ?? admissionData.accountUniversitaly

  return [
    {
      id: "proposal",
      title: "Proposition",
      icon: <FileText className="w-6 h-6" />,
      mainField: undefined,
      fields: [{ label: "Document de proposition", value: admissionData.proposalDocument }],
    },
    {
      id: "reglement",
      title: "Règlement",
      icon: <FileSignature className="w-6 h-6" />,
      mainField: undefined,
      fields: [
        { label: "Contrat", value: admissionData.contractDocument },
        { label: "Email de candidature", value: admissionData.emailForApplication },
      ],
    },
    {
      id: "languageCertificate",
      title: "Certificat de langue",
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
      id: "traduction",
      title: "Traduction",
      icon: <Languages className="w-6 h-6" />,
      mainField: traductionValue,
      fields: [{ label: "Traduction", value: traductionValue }],
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
}: {
  admissionData?: AdmissionData
  prospectId?: string
}) {
  const [candidaturesOpen, setCandidaturesOpen] = useState(false)
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null)
  const [dossierOriginalInfo, setDossierOriginalInfo] = useState<DossierOriginalInfo | null>(null)
  const [selectedStep, setSelectedStep] = useState(0)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [instructionStepId, setInstructionStepId] = useState<string | null>(null)

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

  const instructionBlock = instructionStepId ? blocks.find((b) => b.id === instructionStepId) : null

  const getStepPreview = (block: BlockData): string => {
    if (block.id === "application") {
      return applicationsCount === null ? "Candidatures non chargées" : `${applicationsCount} candidature(s)`
    }
    if (block.id === "dossierOriginal") {
      const s = dossierOriginalInfo?.statutDossier?.trim()
      return s ? `Statut de dossier: ${s}` : "Statut de dossier non disponible"
    }
    const firstField = block.fields.find((f) => formatValue(f.value) !== "—")
    if (!firstField) return "Information manquante"
    const value = formatValue(firstField.value)
    return value.length > 60 ? `${value.slice(0, 57)}...` : value
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
              const state = getBlockTraffic(block)
              const preview = getStepPreview(block)
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
                    className={`@container/admission-step rounded-lg border px-3 py-2.5 sm:px-3.5 ${
                      isCurrent ? "border-[var(--jx-terracotta)]/40 bg-[#fff9f5]" : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div className="flex min-w-0 flex-col gap-2.5 @[560px]/admission-step:flex-row @[560px]/admission-step:items-start @[560px]/admission-step:gap-2">
                      <div className="min-w-0 w-full @[560px]/admission-step:flex-1">
                        <p className="break-words text-xs font-semibold text-zinc-900">{block.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 @[560px]/admission-step:truncate">{preview}</p>
                      </div>
                      <div className="flex w-full min-w-0 flex-row flex-wrap items-center justify-end gap-1.5 @[560px]/admission-step:ml-auto @[560px]/admission-step:w-auto @[560px]/admission-step:shrink-0 @[560px]/admission-step:gap-2">
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
                              className="h-9 w-9 min-w-9 shrink-0 justify-center gap-0 border-violet-300 bg-violet-50 p-0 text-violet-800 hover:bg-violet-100 hover:text-violet-900 @[560px]/admission-step:h-7 @[560px]/admission-step:w-auto @[560px]/admission-step:min-w-0 @[560px]/admission-step:gap-1.5 @[560px]/admission-step:px-2.5"
                              aria-label="Instruction"
                              onClick={() => setInstructionStepId(block.id)}
                            >
                              <BookOpen className="h-4 w-4 shrink-0 @[560px]/admission-step:mr-1 @[560px]/admission-step:h-3.5 @[560px]/admission-step:w-3.5" />
                              <span className="sr-only @[560px]/admission-step:not-sr-only @[560px]/admission-step:inline">
                                Instruction
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Instruction</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 min-w-9 shrink-0 justify-center gap-0 border-[var(--jx-terracotta)]/40 bg-[var(--jx-terracotta)] p-0 text-white hover:bg-[var(--jx-terracotta)]/90 hover:text-white @[560px]/admission-step:h-7 @[560px]/admission-step:w-auto @[560px]/admission-step:min-w-0 @[560px]/admission-step:gap-1.5 @[560px]/admission-step:px-2.5"
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

      <Dialog
        open={instructionStepId !== null}
        onOpenChange={(open) => {
          if (!open) setInstructionStepId(null)
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Instructions{instructionBlock ? ` · ${instructionBlock.title}` : ""}
            </DialogTitle>
            <DialogDescription>À lire avant de passer à l&apos;action sur cette étape.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
            {instructionStepId ? instructionBodyForStep(instructionStepId) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Étape {safeSelectedStep + 1} · {selectedBlock.title}</DialogTitle>
            <DialogDescription>Détails complets de cette étape</DialogDescription>
          </DialogHeader>

          {selectedBlock.id === "application" ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">Consultez vos candidatures pour voir université, formation et statut.</p>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
                <span className="font-medium text-zinc-500">Nombre de candidatures: </span>
                <span className="font-semibold text-zinc-900">{applicationsCount === null ? "—" : applicationsCount}</span>
              </div>
            </div>
          ) : selectedBlock.id === "dossierOriginal" ? (
            <div className="space-y-2">
              <div className="rounded-md border border-zinc-200 bg-zinc-50/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Documents requis</p>
                <p className="mt-1 text-sm text-zinc-900">{dossierOriginalInfo?.requiredDocuments?.trim() || "—"}</p>
              </div>
              <div className="rounded-md border border-zinc-200 bg-zinc-50/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Commentaire</p>
                <p className="mt-1 text-sm text-zinc-900">{dossierOriginalInfo?.commentaire?.trim() || "—"}</p>
              </div>
              <div className="rounded-md border border-zinc-200 bg-zinc-50/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Évaluation du dossier</p>
                <p className="mt-1 text-sm text-zinc-900">{dossierOriginalInfo?.evaluationDossier?.trim() || "—"}</p>
              </div>
              <div className="rounded-md border border-zinc-200 bg-zinc-50/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Statut de dossier</p>
                <p className="mt-1 text-sm text-zinc-900">{dossierOriginalInfo?.statutDossier?.trim() || "—"}</p>
              </div>
            </div>
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
