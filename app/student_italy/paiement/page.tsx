import StudentPaymentsPanel from "@/components/student-payments-panel"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function StudentItalyPaiementPage() {
  return <main className="mx-auto w-full max-w-6xl space-y-6">
    <header>
      <Link href="/student_italy" className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à l’accueil</Link>
      <h1 className="text-2xl font-semibold tracking-tight text-[#173B65]">Mes paiements</h1>
    </header>
    <StudentPaymentsPanel />
  </main>
}
