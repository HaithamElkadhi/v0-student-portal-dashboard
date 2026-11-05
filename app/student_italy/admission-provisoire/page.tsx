"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { AdmissionDetailsContent, type AdmissionData } from "@/components/admission-details"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentAdmissionProvisoirePage() {
  const { studentInfo } = useStudentPortal()

  return <main className="mx-auto w-full max-w-6xl space-y-6">
    <header>
      <Link href="/student_italy" className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à l’accueil</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-[#173B65]">Les étapes de mon admission</h1>
        <Link href="/student_italy/admission" className="inline-flex min-h-11 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-[#173B65] hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]">Voir mes candidatures</Link>
      </div>
    </header>
    <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <AdmissionDetailsContent
        admissionData={studentInfo.admission as AdmissionData | undefined}
        prospectId={studentInfo.folderId}
        contratSigned={studentInfo.contratSigned}
        studentEmail={studentInfo.email}
      />
    </Card>
  </main>
}
