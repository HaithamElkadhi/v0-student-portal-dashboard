"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

interface AdmissionData {
  proposal?: string | string[]
  paymentFirstRate?: string | string[]
  emailForApplication?: string
  declarationOfValue?: string | string[]
  translation?: string | string[]
  admissionFolderDocuments?: string
  application?: string | string[]
  admissionPayment?: string | string[]
  applicationUniversity?: string | string[]
  paymentAcceptanceFees?: string | string[]
}

interface AdmissionDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admissionData?: AdmissionData
}

interface StatusOption {
  value: string
  label: string
}

interface AdmissionStep {
  id: string
  title: string
  type: "multiple-select" | "single-line" | "long-text"
  options?: StatusOption[]
  currentValue?: string | string[]
  placeholder?: string
}

export default function AdmissionDetails({ open, onOpenChange, admissionData }: AdmissionDetailsProps) {
  // Check if a step has a value
  const hasValue = (step: AdmissionStep): boolean => {
    if (!step.currentValue) return false
    if (step.type === "multiple-select") {
      const values = Array.isArray(step.currentValue) ? step.currentValue : [step.currentValue]
      return values.length > 0 && values.some(v => v && String(v).trim() !== "")
    }
    if (step.type === "single-line" || step.type === "long-text") {
      return step.currentValue && String(step.currentValue).trim() !== ""
    }
    return false
  }
  // Normalize Airtable values to match our option values (case-insensitive matching)
  const normalizeValue = (value: string, options: StatusOption[]): string => {
    if (!value) return ""
    const valueLower = value.toLowerCase().trim()
    const matched = options.find(
      (opt) => opt.value.toLowerCase() === valueLower || opt.label.toLowerCase() === valueLower
    )
    return matched?.value || value
  }

  // Convert Airtable array or string to array of normalized values
  const normalizeArrayValue = (value: string | string[] | undefined, options: StatusOption[]): string[] => {
    if (!value) return []
    const values = Array.isArray(value) ? value : [value]
    return values
      .map((v) => normalizeValue(String(v), options))
      .filter((v) => v !== "")
  }

  // Define all options for each field
  const proposalOptions = [
    { value: "not-prepared", label: "Not Prepared" },
    { value: "in-progress", label: "In Progress" },
    { value: "sent", label: "Sent" },
    { value: "in-review", label: "In review" },
    { value: "accepted-signed", label: "Accepted & Signed" },
  ]

  const paymentFirstRateOptions = [
    { value: "invoice-sent", label: "Invoice Sent" },
    { value: "exonerated", label: "Exonerated" },
    { value: "paid", label: "Paid" },
  ]

  const declarationValueOptions = [
    { value: "pronotami-created", label: "Pronotami Account Created" },
    { value: "cimea-in-progress", label: "Cimea In progress" },
    { value: "booked", label: "Booked" },
    { value: "done", label: "Done" },
  ]

  const translationOptions = [
    { value: "no", label: "No" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ]

  const applicationOptions = [
    { value: "in-progress", label: "In progress" },
    { value: "accepted", label: "Accepted" },
    { value: "refused", label: "Refused" },
  ]

  const admissionPaymentOptions = [
    { value: "invoice-sent", label: "Invoice sent" },
    { value: "paid", label: "Paid" },
  ]

  const paymentAcceptanceFeesOptions = [
    { value: "invoice-sent", label: "Invoice sent" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
  ]

  const admissionSteps: AdmissionStep[] = [
    {
      id: "proposal",
      title: "Proposal",
      type: "multiple-select",
      options: proposalOptions,
      currentValue: normalizeArrayValue(admissionData?.proposal, proposalOptions),
    },
    {
      id: "email-application",
      title: "Email For Application",
      type: "single-line",
      placeholder: "No email provided",
      currentValue: admissionData?.emailForApplication || "",
    },
    {
      id: "payment-first-rate",
      title: "Payment First Rate Admission",
      type: "multiple-select",
      options: paymentFirstRateOptions,
      currentValue: normalizeArrayValue(admissionData?.paymentFirstRate, paymentFirstRateOptions),
    },
    {
      id: "application-university",
      title: "Application University",
      type: "single-line",
      placeholder: "No university specified",
      currentValue: admissionData?.applicationUniversity 
        ? (Array.isArray(admissionData.applicationUniversity) 
          ? admissionData.applicationUniversity.join(", ") 
          : String(admissionData.applicationUniversity))
        : "",
    },
    {
      id: "payment-acceptance-fees",
      title: "Payment Acceptance Fees",
      type: "multiple-select",
      options: paymentAcceptanceFeesOptions,
      currentValue: normalizeArrayValue(admissionData?.paymentAcceptanceFees, paymentAcceptanceFeesOptions),
    },
    {
      id: "declaration-value",
      title: "Declaration of Value",
      type: "multiple-select",
      options: declarationValueOptions,
      currentValue: normalizeArrayValue(admissionData?.declarationOfValue, declarationValueOptions),
    },
    {
      id: "translation",
      title: "Translation",
      type: "multiple-select",
      options: translationOptions,
      currentValue: normalizeArrayValue(admissionData?.translation, translationOptions),
    },
    {
      id: "admission-folder-documents",
      title: "Admission Folder Documents",
      type: "long-text",
      placeholder: "No document details provided",
      currentValue: admissionData?.admissionFolderDocuments || "",
    },
    {
      id: "application",
      title: "Application",
      type: "multiple-select",
      options: applicationOptions,
      currentValue: normalizeArrayValue(admissionData?.application, applicationOptions),
    },
    {
      id: "admission-payment",
      title: "Admission Payment",
      type: "multiple-select",
      options: admissionPaymentOptions,
      currentValue: normalizeArrayValue(admissionData?.admissionPayment, admissionPaymentOptions),
    },
  ]

  const getStatusBadgeColor = (step: AdmissionStep) => {
    if (step.type === "multiple-select" && step.currentValue) {
      const values = Array.isArray(step.currentValue) ? step.currentValue : [step.currentValue]
      const valuesLower = values.map(v => String(v).toLowerCase())
      
      // Check for positive/completed statuses
      if (
        valuesLower.some(v => 
          v.includes("done") || 
          v.includes("accepted") || 
          v.includes("paid") || 
          v.includes("exonerated") ||
          v.includes("signed") ||
          v.includes("completed")
        )
      ) {
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      }
      
      // Check for negative/refused statuses
      if (valuesLower.some(v => v.includes("refused") || v.includes("rejected"))) {
        return "bg-red-500/20 text-red-700 dark:text-red-400"
      }
      
      // Check for in-progress statuses
      if (
        valuesLower.some(v => 
          v.includes("in-progress") || 
          v.includes("in progress") ||
          v.includes("in-review") ||
          v.includes("in review") ||
          v.includes("sent") ||
          v.includes("booked") ||
          v.includes("cimea")
        )
      ) {
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      }
      
      // Check for not started/not prepared
      if (valuesLower.some(v => v.includes("not-prepared") || v.includes("not prepared") || v === "no")) {
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
      }
    }
    return "bg-muted text-muted-foreground"
  }

  const formatCurrentValue = (step: AdmissionStep) => {
    if (step.type === "multiple-select" && step.currentValue) {
      const values = Array.isArray(step.currentValue) ? step.currentValue : [step.currentValue]
      if (values.length === 0) return "—"
      
      return values
        .map((val) => {
          // Try exact match first
          const option = step.options?.find((opt) => opt.value === val || opt.value.toLowerCase() === String(val).toLowerCase())
          if (option) return option.label
          
          // Try label match
          const labelMatch = step.options?.find((opt) => opt.label.toLowerCase() === String(val).toLowerCase())
          if (labelMatch) return labelMatch.label
          
          // Return the actual value if no match found (for Airtable raw values)
          return String(val)
        })
        .join(", ")
    }
    if (step.type === "single-line") {
      return step.currentValue || step.placeholder || "—"
    }
    if (step.type === "long-text") {
      return step.currentValue || step.placeholder || "No details provided"
    }
    return "—"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Admission Details</DialogTitle>
          <DialogDescription>Track all steps of your admission process</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {admissionSteps
            .filter((step) => hasValue(step))
            .map((step, index) => (
              <Card key={step.id} className="p-4 border-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>

                    <div className="ml-11">
                      {step.type === "multiple-select" && (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(step)}`}>
                          {formatCurrentValue(step)}
                        </span>
                      )}

                      {step.type === "single-line" && (
                        <p className="text-sm text-foreground bg-muted/50 p-2 rounded border">
                          {formatCurrentValue(step)}
                        </p>
                      )}

                      {step.type === "long-text" && (
                        <p className="text-sm text-foreground bg-muted/50 p-3 rounded border whitespace-pre-wrap min-h-[60px]">
                          {formatCurrentValue(step)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
        
        {admissionSteps.filter((step) => hasValue(step)).length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No admission details available at this time.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

