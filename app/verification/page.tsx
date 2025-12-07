"use client"

import { useRouter } from "next/navigation"
import StudentVerification from "@/components/student-verification"

interface FileAttachment {
  id: string
  url: string
  filename: string
  size?: number
  type?: string
}

interface StudentInfo {
  name: string
  email: string
  folderId: string
  surname?: string
  gender?: string
  phone?: string
  whatsapp?: string
  birthday?: string
  citizenship?: string
  countryOfResidence?: string
  fullAddress?: string
  passportValidity?: string
  photo?: any
  admission?: {
    // Bloc 1 - Proposal
    proposalDocument?: string | string[] | FileAttachment[]
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
  accountStatus?: string
}

export default function VerificationPage() {
  const router = useRouter()

  const handleSuccess = (info: StudentInfo) => {
    // Store student info in sessionStorage for the dashboard
    if (typeof window !== "undefined") {
      sessionStorage.setItem("studentInfo", JSON.stringify(info))
    }
    router.push("/student_italy")
  }

  const handleBack = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center p-4">
        <StudentVerification onSuccess={handleSuccess} onBack={handleBack} />
      </div>
    </main>
  )
}
