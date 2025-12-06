"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { FileText, CreditCard, FolderOpen, CheckCircle, GraduationCap } from "lucide-react"

interface AdmissionData {
  // Bloc 1 - Proposal
  proposalDocument?: string | string[]
  proposalStatus?: string | string[]
  // Bloc 2 - Paiement
  upfrontPaiement?: string | string[]
  finalPaiement?: string | string[]
  // Bloc 3 - Documents
  admissionFolderDocuments?: string
  documentEvaluation?: string | string[]
  translation?: string | string[]
  declarationOfValue?: string | string[]
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
}

interface BlockData {
  id: string
  title: string
  icon: React.ReactNode
  mainField: string | string[] | undefined
  fields: Array<{
    label: string
    value: string | string[] | undefined
  }>
}

// Helper function to format values
const formatValue = (value: string | string[] | undefined): string => {
  if (!value) return "—"
  if (Array.isArray(value)) {
    return value.filter(v => v && String(v).trim() !== "").join(", ") || "—"
  }
  return String(value).trim() || "—"
}

// Helper function to check if a value is completed
const isCompleted = (value: string | string[] | undefined): boolean => {
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
const isInProgress = (value: string | string[] | undefined): boolean => {
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
const hasValue = (value: string | string[] | undefined): boolean => {
  return value !== undefined && value !== null && formatValue(value) !== "—"
}

// Helper function to determine status badge
const getStatusBadge = (value: string | string[] | undefined): { text: string; className: string } => {
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

// Helper function to determine timeline icon color for a block
const getTimelineIconColor = (block: BlockData): "green" | "yellow" | "red" => {
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

export default function AdmissionDetails({ open, onOpenChange, admissionData }: AdmissionDetailsProps) {
  if (!admissionData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Admission Details</DialogTitle>
            <DialogDescription>Track all steps of your admission process</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No admission details available at this time.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Define the 5 blocks
  const blocks: BlockData[] = [
    {
      id: "proposal",
      title: "Proposal",
      icon: <FileText className="w-6 h-6" />,
      mainField: admissionData.proposalStatus || admissionData.proposal,
      fields: [
        { label: "Proposal Document", value: admissionData.proposalDocument },
        { label: "Proposal Status", value: admissionData.proposalStatus || admissionData.proposal },
      ],
    },
    {
      id: "paiement",
      title: "Paiement",
      icon: <CreditCard className="w-6 h-6" />,
      mainField: admissionData.finalPaiement || admissionData.paymentAcceptanceFees,
      fields: [
        { label: "Upfront Paiement", value: admissionData.upfrontPaiement || admissionData.paymentFirstRate },
        { label: "Acceptance Paiement", value: admissionData.finalPaiement || admissionData.paymentAcceptanceFees },
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
      id: "requirements",
      title: "Requirements",
      icon: <CheckCircle className="w-6 h-6" />,
      mainField: admissionData.accountUniversitaly || admissionData.accountPrenotami,
      fields: [
        { label: "Email for application", value: admissionData.emailForApplication },
        { label: "Account Universitaly", value: admissionData.accountUniversitaly },
        { label: "Account Prenotami", value: admissionData.accountPrenotami },
      ],
    },
    {
      id: "application",
      title: "Application",
      icon: <GraduationCap className="w-6 h-6" />,
      mainField: admissionData.applicationUniversity || admissionData.application,
      fields: [
        { label: "Application status", value: admissionData.applicationUniversity || admissionData.application },
      ],
    },
  ]

  // Determine current step for timeline
  const getCurrentStep = (): number => {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      const status = getStatusBadge(block.mainField)
      if (status.text === "Completed" || status.text === "In Progress") {
        return i
      }
    }
    return 0
  }

  const currentStep = getCurrentStep()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Admission Details</DialogTitle>
          <DialogDescription>Track all steps of your admission process</DialogDescription>
        </DialogHeader>

        {/* Timeline Bar */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / (blocks.length - 1)) * 100}%` }}
            />
            
            {/* Step indicators */}
            {blocks.map((block, index) => {
              const iconColor = getTimelineIconColor(block)
              const colorClasses = {
                green: "bg-green-500 border-green-500 text-white",
                yellow: "bg-yellow-500 border-yellow-500 text-white",
                red: "bg-red-500 border-red-500 text-white",
              }
              return (
                <div key={block.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${colorClasses[iconColor]}`}
                  >
                    {block.icon}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center max-w-[80px]">
                    {block.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {blocks.map((block) => {
            const status = getStatusBadge(block.mainField)
            return (
              <Card key={block.id} className="p-6 border-2 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {block.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${status.className}`}>
                    {status.text}
                  </span>
                </div>

                {/* Fields */}
                <div className="space-y-2">
                  {block.fields.map((field, index) => {
                    const fieldValue = formatValue(field.value)
                    return (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-muted-foreground">{field.label}:</span>{" "}
                        <span className={fieldValue === "—" ? "text-muted-foreground italic" : "text-foreground"}>
                          {fieldValue}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
