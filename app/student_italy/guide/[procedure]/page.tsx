import { notFound } from "next/navigation"
import { procedures } from "../procedures"
import { ProcedureDetails } from "../procedure-details"

export const dynamicParams = false

export function generateStaticParams() {
  return procedures.map(({ slug }) => ({ procedure: slug }))
}

export default async function StudentProcedurePage({ params }: { params: Promise<{ procedure: string }> }) {
  const { procedure } = await params
  const entry = procedures.find(({ slug }) => slug === procedure)
  if (!entry) notFound()

  return <ProcedureDetails entry={entry} backHref="/student_italy/preparation" backLabel="Retour à la préparation" />
}
