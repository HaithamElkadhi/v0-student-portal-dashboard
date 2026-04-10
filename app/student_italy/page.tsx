"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StudentDashboard from "@/components/student-dashboard"

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

export default function StudentItalyPage() {
  const router = useRouter()
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get student info from sessionStorage
    if (typeof window !== "undefined") {
      const storedInfo = sessionStorage.getItem("studentInfo")
      if (storedInfo) {
        try {
          const parsedInfo = JSON.parse(storedInfo)
          setStudentInfo(parsedInfo)
        } catch (error) {
          console.error("Error parsing student info:", error)
          router.push("/")
        }
      } else {
        // No student info found, redirect to landing / sign-in
        router.push("/")
      }
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    // Clear sessionStorage and redirect to home
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("studentInfo")
    }
    router.push("/")
  }

  const handleRefresh = (updatedInfo: StudentInfo) => {
    // Update sessionStorage with new info
    if (typeof window !== "undefined") {
      sessionStorage.setItem("studentInfo", JSON.stringify(updatedInfo))
    }
    setStudentInfo(updatedInfo)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!studentInfo) {
    return null // Will redirect in useEffect
  }

  return (
    <StudentDashboard
      onLogout={handleLogout}
      studentInfo={studentInfo}
      onRefresh={handleRefresh}
    />
  )
}
