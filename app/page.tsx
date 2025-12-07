"use client"

import { useState } from "react"
import StudentVerification from "@/components/student-verification"
import StudentDashboard from "@/components/student-dashboard"

export default function Page() {
  const [currentPage, setCurrentPage] = useState("login-selection")
  const [userRole, setUserRole] = useState<"student" | null>(null)
  const [studentInfo, setStudentInfo] = useState<{
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
    accountStatus?: string
  } | null>(null)

  const handleStudentClick = () => {
    setUserRole("student")
    setCurrentPage("student-verification")
  }

  const handleStudentVerified = (info: {
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
    accountStatus?: string
  }) => {
    setStudentInfo(info)
    setCurrentPage("student-dashboard")
  }

  const handleLogout = () => {
    setCurrentPage("login-selection")
    setUserRole(null)
    setStudentInfo(null)
  }

  const handleRefresh = (updatedInfo: {
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
    accountStatus?: string
  }) => {
    setStudentInfo(updatedInfo)
  }

  return (
    <main className="min-h-screen bg-background">
      {currentPage === "login-selection" && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoginSelection onStudentClick={handleStudentClick} />
        </div>
      )}
      {currentPage === "student-verification" && userRole === "student" && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <StudentVerification
            onSuccess={handleStudentVerified}
            onBack={() => {
              setCurrentPage("login-selection")
              setUserRole(null)
            }}
          />
        </div>
      )}
      {currentPage === "student-dashboard" && userRole === "student" && studentInfo && (
        <StudentDashboard onLogout={handleLogout} studentInfo={studentInfo} onRefresh={handleRefresh} />
      )}
    </main>
  )
}

function LoginSelection({ onStudentClick }: { onStudentClick: () => void }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src="/Jeexpert Logo base.png" 
            alt="JEEXPERT Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">JEEXPERT</h1>
        <p className="text-lg text-muted-foreground">Student Portal</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onStudentClick}
          className="group p-8 rounded-xl bg-card border-2 border-border hover:border-primary transition-all duration-300 text-left hover:shadow-lg max-w-md w-full"
        >
          <div className="mb-4 w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
            S
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            Student Login
          </h2>
          <p className="text-muted-foreground">Access your admission, visa, and scholarship status</p>
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12">Secure portal for JEEXPERT student management</p>
    </div>
  )
}
