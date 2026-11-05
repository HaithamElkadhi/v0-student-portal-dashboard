"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ViewApplications from "@/components/view-applications"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentAdmissionPanel() {
  const { studentInfo } = useStudentPortal()

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <Link href="/student_italy" className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à l’accueil</Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#173B65]">Mes candidatures</h1>
        <p className="mt-2 text-sm text-slate-500">Suivez vos candidatures par université et formation.</p>
      </header>
      <section aria-label="Tableau des candidatures" className="min-w-0 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-5">
        <ViewApplications open inline prospectId={studentInfo.folderId} />
      </section>
    </main>
  )
}
