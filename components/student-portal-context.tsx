"use client"

import { createContext, useContext, type ReactNode } from "react"

export interface PortalAdmissionData {
  proposalDocument?: unknown
  /** Fichier contrat (table prospects) — présence = étape Règlement passée */
  contractDocument?: unknown
  proposalStatus?: string | string[]
  upfrontPaiement?: string | string[]
  finalPaiement?: string | string[]
  admissionFolderDocuments?: string
  documentEvaluation?: string | string[]
  translation?: string | string[]
  declarationOfValue?: string | string[]
  languageCertificate?: unknown
  formulaireDossierOriginal?: string | string[]
  emailForApplication?: string
  accountUniversitaly?: string | string[]
  accountPrenotami?: string | string[]
  applicationUniversity?: string | string[]
  proposal?: string | string[]
  paymentFirstRate?: string | string[]
  application?: string | string[]
  admissionPayment?: string | string[]
  paymentAcceptanceFees?: string | string[]
}

export interface PortalStudentInfo {
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
  numberApplications?: string | number
  photo?: unknown
  admission?: PortalAdmissionData
  accountStatus?: string
}

export interface StudentPortalContextValue {
  studentInfo: PortalStudentInfo
  setStudentInfo: (u: PortalStudentInfo) => void
  onLogout: () => void
  reloadFromApi: () => Promise<void>
  isRefreshing: boolean
}

const StudentPortalContext = createContext<StudentPortalContextValue | null>(null)

export function StudentPortalProvider({
  children,
  value,
}: {
  children: ReactNode
  value: StudentPortalContextValue
}) {
  return <StudentPortalContext.Provider value={value}>{children}</StudentPortalContext.Provider>
}

export function useStudentPortal() {
  const ctx = useContext(StudentPortalContext)
  if (!ctx) {
    throw new Error("useStudentPortal must be used within StudentPortalProvider")
  }
  return ctx
}
