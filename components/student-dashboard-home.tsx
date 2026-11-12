"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, CalendarDays, FolderOpen } from "lucide-react"
import StudentProfileSummary from "@/components/student-profile-summary"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentDashboardHome() {
  const { studentInfo } = useStudentPortal()
  const firstName = studentInfo.name.trim().split(/\s+/)[0] || ""
  return <main className="mx-auto w-full max-w-[1400px] space-y-5 sm:space-y-7">
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.68fr)_minmax(0,1fr)] xl:gap-6">
      <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#062F53] to-[#082644] p-5 text-white sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-5 -z-10 hidden size-40 rounded-2xl border-2 border-[#52C7EE]/80 sm:block" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-2 right-14 -z-10 hidden size-28 rounded-2xl border-2 border-[#52C7EE]/80 sm:block" />
        <h1 className="break-words text-3xl font-semibold tracking-tight sm:max-w-[78%] sm:text-4xl 2xl:text-5xl">Bonjour{firstName ? ", " + firstName : ""}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/90 sm:max-w-[76%] sm:text-lg">Suivez les étapes de votre dossier étudiant.</p>
        <Link href="/student_italy/documents" className="mt-5 inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-xl border border-white/80 bg-[#082644]/80 px-4 py-2.5 text-sm font-medium hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-base">
          <FolderOpen className="size-5 shrink-0" aria-hidden="true" />
          <span className="break-all">Dossier {studentInfo.folderId || "à confirmer"}</span>
        </Link>
        <Link href="/student_italy/guide" className="mt-2 flex min-h-11 w-fit max-w-full items-center gap-2 rounded-lg text-sm font-medium text-white underline decoration-white/60 underline-offset-4 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <BookOpen className="size-4 shrink-0" aria-hidden="true" /> Guide des démarches
        </Link>
      </section>
      <section className="flex min-w-0 flex-col justify-center gap-4 rounded-2xl border border-[#C5DEEE] bg-[#E2F4FC] p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <CalendarDays className="mt-0.5 size-8 shrink-0 text-[#173B65] sm:size-10" strokeWidth={1.7} aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-[#092C51] sm:text-2xl">Accompagnement personnalisé</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">Un conseiller JEEXPERT vous accompagne à chaque étape.</p>
          </div>
        </div>
        <Link href="/student_italy/rendez-vous" className="inline-flex min-h-11 items-center justify-center gap-3 rounded-xl bg-[#082F53] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#173B65] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65] sm:self-start">
          Réserver un rendez-vous <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      </section>
    </div>
    <StudentProfileSummary />
  </main>
}
