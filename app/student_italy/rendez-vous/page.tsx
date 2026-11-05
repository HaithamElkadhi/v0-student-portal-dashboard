"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentBookingPage() {
  const { studentInfo } = useStudentPortal()
  const bookingBase = process.env.NEXT_PUBLIC_BOOKING_URL || "https://book.jeexpert.com"
  const bookingUrl = bookingBase.split("#")[0] + "#" + new URLSearchParams({
    studentName: [studentInfo.name, studentInfo.surname].filter(Boolean).join(" "),
    email: studentInfo.email,
    phone: studentInfo.phone || studentInfo.whatsapp || "",
    meetingType: "Follow up",
  }).toString()

  return <main className="mx-auto w-full max-w-6xl space-y-5">
    <header>
      <Link href="/student_italy" className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à l’accueil</Link>
      <h1 className="text-2xl font-semibold tracking-tight text-[#173B65]">Réserver un rendez-vous</h1>
      <p className="mt-2 text-sm text-slate-500">Choisissez votre créneau avec votre conseiller JEEXPERT.</p>
    </header>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <iframe src={bookingUrl} title="Réservation d’un rendez-vous JEEXPERT" className="block h-[80dvh] min-h-[640px] w-full border-0" referrerPolicy="strict-origin-when-cross-origin" />
    </div>
  </main>
}
