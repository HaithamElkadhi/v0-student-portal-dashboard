import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { guideWhatsApp, procedures } from "./procedures"

export default function StudentGuidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
      <header className="border-b border-[#BCD6EC] pb-5 sm:pb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#173B65]">Espace étudiant</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#092C51] sm:text-4xl">Guide des démarches</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Préparez votre candidature, trouvez un traducteur et repérez le test demandé par votre université.
        </p>
      </header>

      <ol className="grid gap-4 lg:grid-cols-2">
        {procedures.map(({ slug, title, label, description, icon: Icon }, index) => (
          <li key={slug} className="min-w-0">
            <Link href={"/student_italy/guide/" + slug} className="group flex h-full flex-col rounded-xl border border-[#BCD6EC] bg-white p-5 transition-colors hover:border-[#173B65] hover:bg-[#F9FCFE] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173B65] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg bg-[#E8F4FB] text-[#173B65]"><Icon className="size-6" strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="text-sm font-medium tabular-nums text-slate-500" aria-hidden="true">0{index + 1}</span>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#173B65]">{label}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#092C51] sm:text-2xl">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
              <span className="mt-5 flex items-center justify-between gap-2 border-t border-[#D9E2EC] pt-4 text-sm font-semibold text-[#173B65]">
                Consulter la fiche <ArrowRight className="size-4 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <aside className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#BCD6EC] bg-[#E2F4FC] p-5 sm:p-6">
        <div><h2 className="font-semibold text-[#092C51]">Quelle démarche vous concerne ?</h2><p className="mt-1 text-sm text-slate-600">Demandez à votre conseiller de vérifier votre situation.</p></div>
        <a href={guideWhatsApp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#173B65] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#082F53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65] sm:w-auto">
          <MessageCircle className="size-4 shrink-0" aria-hidden="true" /> Contactez-nous sur WhatsApp
        </a>
      </aside>
    </main>
  )
}
