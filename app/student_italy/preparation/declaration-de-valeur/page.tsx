import { notFound } from "next/navigation"
import { ProcedureDetails } from "../../guide/procedure-details"
import { procedures } from "../../guide/procedures"

export default function PreparationDeclarationDeValeurPage() {
  const entry = procedures.find(({ slug }) => slug === "declaration-de-valeur")
  if (!entry) notFound()

  return (
    <ProcedureDetails
      entry={entry}
      backHref="/student_italy/preparation"
      backLabel="Retour à la préparation"
    />
  )
}
