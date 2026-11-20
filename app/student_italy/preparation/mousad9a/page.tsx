import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { mousad9aGuide as guide } from "@/lib/mousad9a-guide"

export default function Mousad9aPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-5">
      <Link href="/student_italy/preparation" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-2">
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour à la préparation
      </Link>
      <header className="space-y-4 rounded-xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <h1 className="text-2xl font-semibold text-[#173B65] sm:text-3xl">{guide.title}</h1>
        <p className="text-sm leading-relaxed text-slate-700">{guide.introduction}</p>
        <a href="/student_italy/preparation/mousad9a/pdf" download className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#173B65] px-4 text-sm font-medium text-white hover:bg-[#123052] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65]">
          <Download className="size-4" aria-hidden="true" /> Télécharger le guide PDF
        </a>
      </header>
      <section className="rounded-xl border border-[#D9E2EC] bg-white p-4 sm:p-7">
        <h2 id="administrations" className="text-xl font-semibold text-[#173B65]">À quelle administration vous adresser</h2>
        <table aria-labelledby="administrations" className="mt-4 w-full table-fixed text-left text-sm">
          <thead className="bg-[#E8F4FB] text-[#173B65]">
            <tr><th scope="col" className="w-2/5 p-2 sm:p-3">Document</th><th scope="col" className="p-2 sm:p-3">Administration compétente</th></tr>
          </thead>
          <tbody className="divide-y divide-[#D9E2EC]">
            {guide.administrations.map(([document, administration]) => (
              <tr key={document} className="align-top">
                <th scope="row" className="break-words p-2 font-medium sm:p-3">{document}</th>
                <td className="break-words p-2 text-slate-700 sm:p-3">{administration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rounded-xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#173B65]">Comment faire la mousad9a</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-5 marker:font-semibold marker:text-[#173B65]">
          {guide.steps.map(({ title, text }) => (
            <li key={title} className="pl-1">
              <h3 className="font-semibold text-[#173B65]">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-xl border border-[#D9E2EC] bg-[#F4F9FD] p-5 sm:p-7">
        <h2 className="font-semibold text-[#173B65]">Exemple pour le baccalauréat</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{guide.example}</p>
        <a href={guide.source} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-[#173B65] underline underline-offset-4">Consulter les consignes de l’Ambassade d’Italie à Tunis</a>
      </section>
    </main>
  )
}
