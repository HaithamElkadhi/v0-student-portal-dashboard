"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, FileSignature, FolderOpen, CheckCircle, GraduationCap, Languages } from "lucide-react"
import ViewApplications from "@/components/view-applications"

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
    return { text: "Missing", className: "bg-gray-500/20 text-gray-700 dark:text-gray-400" }
  }
  
  // Check for completed/positive statuses
  if (isCompleted(value)) {
    return { text: "Completed", className: "bg-green-500/20 text-green-700 dark:text-green-400" }
  }
  
  // Check for in-progress statuses
  if (isInProgress(value)) {
    return { text: "In Progress", className: "bg-blue-500/20 text-blue-700 dark:text-blue-400" }
  }
  
  // Check for rejected/negative statuses
  if (strValue.includes("rejected") || strValue.includes("refused")) {
    return { text: "Rejected", className: "bg-red-500/20 text-red-700 dark:text-red-400" }
  }
  
  // Check for not started
  if (strValue.includes("not started") || strValue.includes("not-prepared") || strValue === "no") {
    return { text: "Not Started", className: "bg-gray-500/20 text-gray-700 dark:text-gray-400" }
  }
  
  // Default: has value but status unclear
  return { text: "In Progress", className: "bg-blue-500/20 text-blue-700 dark:text-blue-400" }
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
  return [
    {
      id: "proposal",
      title: "Proposal",
      icon: <FileText className="w-6 h-6" />,
      mainField: undefined,
      fields: [{ label: "Proposal Document", value: admissionData.proposalDocument }],
    },
    {
      id: "reglement",
      title: "Règlement",
      icon: <FileSignature className="w-6 h-6" />,
      mainField: undefined,
      fields: [
        { label: "Contrat", value: admissionData.contractDocument },
        { label: "Email for application", value: admissionData.emailForApplication },
      ],
    },
    {
      id: "documents",
      title: "Documents",
      icon: <FolderOpen className="w-6 h-6" />,
      mainField: admissionData.documentEvaluation,
      fields: [
        { label: "Content of folder", value: admissionData.admissionFolderDocuments },
        { label: "Evaluation of folder", value: admissionData.documentEvaluation },
        { label: "Translation status", value: admissionData.translation },
        { label: "Declaration of value", value: admissionData.declarationOfValue },
      ],
    },
    {
      id: "languageCertificate",
      title: "Language certificate",
      icon: <Languages className="w-6 h-6" />,
      mainField: undefined,
      fields: [{ label: "Language Certificate", value: admissionData.languageCertificate }],
    },
    {
      id: "requirements",
      title: "Requirements",
      icon: <CheckCircle className="w-6 h-6" />,
      mainField: admissionData.accountUniversitaly || admissionData.accountPrenotami,
      fields: [
        { label: "Account Universitaly", value: admissionData.accountUniversitaly },
        { label: "Account Prenotami", value: admissionData.accountPrenotami },
      ],
    },
    {
      id: "application",
      title: "Par candidature",
      icon: <GraduationCap className="w-6 h-6" />,
      mainField: admissionData.applicationUniversity || admissionData.application,
      fields: [],
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

  if (!admissionData) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">No admission details available at this time.</p>
      </div>
    )
  }

  const blocks = buildAdmissionBlocks(admissionData)

  const blockLooksStartedOrDone = (block: BlockData): boolean => {
    if (block.id === "proposal") {
      return proposalDocumentPresent(admissionData)
    }
    if (block.id === "reglement") {
      return contractDocumentPresent(admissionData)
    }
    if (block.id === "languageCertificate") {
      return languageCertificateTraffic(admissionData.languageCertificate) !== "red"
    }
    const status = getStatusBadge(block.mainField)
    return status.text === "Completed" || status.text === "In Progress"
  }

  const getCurrentStep = (): number => {
    for (let i = 0; i < blocks.length; i++) {
      if (blockLooksStartedOrDone(blocks[i])) {
        return i
      }
    }
    return 0
  }

  const currentStep = getCurrentStep()
  const progressDenominator = Math.max(1, blocks.length - 1)

  return (
    <>
      <div className="mb-8 mt-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />
          <div
            className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / progressDenominator) * 100}%` }}
          />

          {blocks.map((block) => {
            const iconColor = getTimelineIconColor(block, admissionData)
            const colorClasses = {
              green: "border-green-500 bg-green-500 text-white",
              yellow: "border-yellow-500 bg-yellow-500 text-white",
              red: "border-red-500 bg-red-500 text-white",
            }
            return (
              <div key={block.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${colorClasses[iconColor]}`}
                >
                  {block.icon}
                </div>
                <span
                  className={`mt-2 text-center text-xs font-medium ${block.id === "application" ? "max-w-[100px]" : "max-w-[80px]"}`}
                >
                  {block.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => {
          const status =
            block.id === "proposal"
              ? proposalStepBadge(admissionData)
              :             block.id === "reglement"
                ? reglementStepBadge(admissionData)
                : block.id === "languageCertificate"
                  ? languageCertificateStepBadge(admissionData.languageCertificate)
                  : getStatusBadge(block.mainField)
          return (
            <Card key={block.id} className="border-2 p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">{block.icon}</div>
                <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
              </div>

              <div className="mb-4">
                <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}>
                  {status.text}
                </span>
              </div>

              {block.id === "application" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ouvrez le tableau pour voir le détail de vos candidatures (université, formation, statut).
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={!prospectId}
                    onClick={() => setCandidaturesOpen(true)}
                  >
                    Afficher
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {block.fields.map((field, index) => {
                    const fieldValue = formatValue(field.value)
                    const isFileField =
                      (field.label === "Proposal Document" ||
                        field.label === "Contrat" ||
                        field.label === "Language Certificate") &&
                      isFileAttachment(field.value)

                    return (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-muted-foreground">{field.label}:</span>{" "}
                        {isFileField && field.value ? (
                          <div className="mt-1 space-y-1">
                            {(field.value as FileAttachment[]).map((file, fileIndex) => (
                              <a
                                key={file.id || fileIndex}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={file.filename}
                                className="inline-flex cursor-pointer items-center gap-2 text-primary underline transition-colors hover:text-primary/80"
                              >
                                <FileText className="h-4 w-4" />
                                <span>{file.filename}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className={fieldValue === "—" ? "italic text-muted-foreground" : "text-foreground"}>
                            {fieldValue}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {prospectId ? (
        <ViewApplications
          open={candidaturesOpen}
          onOpenChange={setCandidaturesOpen}
          prospectId={prospectId}
        />
      ) : null}
    </>
  )
}

export default function AdmissionDetails({ open, onOpenChange, admissionData, prospectId }: AdmissionDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Admission Details</DialogTitle>
          <DialogDescription>Track all steps of your admission process</DialogDescription>
        </DialogHeader>
        <AdmissionDetailsContent admissionData={admissionData} prospectId={prospectId} />
      </DialogContent>
    </Dialog>
  )
}
