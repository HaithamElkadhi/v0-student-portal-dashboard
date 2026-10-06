import StudentTicketForm from "@/components/student-ticket-form"

export default function SupportPage() {
  return <main className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
    <h1 className="sr-only">Support étudiant</h1>
    <StudentTicketForm />
  </main>
}
