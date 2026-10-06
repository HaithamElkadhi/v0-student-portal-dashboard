"use client"

import Link from "next/link"
import { ArrowUpRight, MessageCircle } from "lucide-react"
import StudentProfileSummary from "@/components/student-profile-summary"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentDashboardHome() {
  const { studentInfo } = useStudentPortal()
  const firstName = studentInfo.name.trim().split(/\s+/)[0] || ""
  const initials = ((firstName[0] || "") + (studentInfo.surname?.[0] || "")).toUpperCase()
  const photo = Array.isArray(studentInfo.photo) ? studentInfo.photo[0]?.url : typeof studentInfo.photo === "string" ? studentInfo.photo : null
  return <main className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Link href="/student_italy/profil" aria-label="Voir mon profil" className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#173B65]/5 text-base font-semibold text-[#173B65] ring-1 ring-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65] sm:h-14 sm:w-14">
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials || "J"}
        </Link>
        <div className="min-w-0"><p className="text-xs font-medium text-zinc-500">Votre espace étudiant</p><h1 className="mt-1 break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Bonjour{firstName ? ", " + firstName : ""}</h1><p className="mt-1 text-xs text-zinc-500">Dossier <span className="font-medium text-zinc-700">{studentInfo.folderId || "à confirmer"}</span></p></div>
      </div>
      <a href="https://wa.me/393520880880" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"><MessageCircle className="h-4 w-4" aria-hidden />Contacter JEEXPERT<ArrowUpRight className="h-4 w-4" aria-hidden /></a>
    </section>
    <StudentProfileSummary />
  </main>
}
