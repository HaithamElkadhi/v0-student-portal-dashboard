"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import StudentProposalDetails from "@/components/student-proposal-details"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentOrientationPage() {
  const { studentInfo } = useStudentPortal()
  return <main className="mx-auto w-full max-w-4xl space-y-6">
    <header>
      <Link href="/student_italy" className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à l’accueil</Link>
      <h1 className="text-2xl font-semibold tracking-tight text-[#173B65]">Ma fiche d’orientation</h1>
    </header>
    <StudentProposalDetails prospectId={studentInfo.folderId} />
  </main>
}
