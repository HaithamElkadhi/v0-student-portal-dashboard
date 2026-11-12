import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, MessageCircle, Phone } from "lucide-react"
import { guideWhatsApp, procedures } from "../procedures"

export const dynamicParams = false

export function generateStaticParams() {
  return procedures.map(({ slug }) => ({ procedure: slug }))
}

export default async function StudentProcedurePage({ params }: { params: Promise<{ procedure: string }> }) {
  const { procedure } = await params
  const entry = procedures.find(({ slug }) => slug === procedure)
  if (!entry) notFound()

  const Icon = entry.icon
  const whatsapp = guideWhatsApp + "?text=" + encodeURIComponent(entry.whatsappMessage)

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
      <Link href="/student_italy/guide" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65]">
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour au guide
      </Link>

      <header className="flex flex-col gap-5 rounded-xl border border-[#BCD6EC] bg-white p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#E8F4FB] text-[#173B65]"><Icon className="size-6" strokeWidth={1.7} aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#173B65]">{entry.label}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#092C51] sm:text-4xl">{entry.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{entry.scope}</p>
          </div>
        </div>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#173B65] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#082F53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65] sm:w-fit">
          <MessageCircle className="size-4 shrink-0" aria-hidden="true" /> Contactez-nous sur WhatsApp
        </a>
      </header>

      <div className="space-y-5">
        {entry.directory && (
          <section aria-labelledby="translator-directory" className="rounded-xl border border-[#BCD6EC] bg-white p-5 sm:p-7">
            <h2 id="translator-directory" className="text-xl font-semibold tracking-tight text-[#092C51]">Coordonnées par région</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Confirmez la disponibilité, le délai et le tarif directement avec le traducteur.</p>
            <div className="mt-5 space-y-6">
              {entry.directory.map(({ area, contacts }) => (
                <div key={area}>
                  <h3 className="text-sm font-semibold text-[#173B65]">{area}</h3>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {contacts.map(({ name, city, phone }) => (
                      <li key={name} className="min-w-0 rounded-lg border border-[#D9E2EC] px-3 pt-3">
                        <p className="text-sm font-semibold text-[#172D43]">{name}</p>
                        <p className="mt-1 text-xs text-slate-600">{city}</p>
                        <a href={`tel:+216${phone.replaceAll(" ", "")}`} aria-label={`Appeler ${name} au +216 ${phone}`} className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-2 focus-visible:outline-[#173B65]">
                          <Phone className="size-4" aria-hidden="true" /> +216 {phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        <section aria-labelledby="procedure-steps" className="min-w-0 rounded-xl border border-[#BCD6EC] bg-white p-5 sm:p-7">
          <h2 id="procedure-steps" className="text-xl font-semibold tracking-tight text-[#092C51]">Les {entry.steps.length} étapes</h2>
          <ol className="mt-3 divide-y divide-[#D9E2EC]">
            {entry.steps.map(({ title, text, items }, index) => (
              <li key={title} className="flex items-start gap-3 py-4 sm:gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#E8F4FB] text-xs font-semibold tabular-nums text-[#173B65]" aria-hidden="true">0{index + 1}</span>
                <div className="min-w-0 max-w-3xl">
                  <h3 className="text-sm font-semibold text-[#172D43] sm:text-base">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                  {items && <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-slate-700">{items.map(item => <li key={item}>{item}</li>)}</ul>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside aria-labelledby="procedure-links" className="min-w-0 rounded-xl border border-[#BCD6EC] bg-[#F4F9FD] p-5">
          <h2 id="procedure-links" className="text-base font-semibold text-[#092C51]">Liens officiels</h2>
          <ul className="mt-3 divide-y divide-[#D9E2EC]">
            {entry.links.map(({ label, href }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-3 rounded-md py-2.5 text-sm font-medium leading-relaxed text-[#173B65] hover:underline focus-visible:outline-2 focus-visible:outline-[#173B65]">
                  <span>{label}</span><ExternalLink className="size-4 shrink-0" aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  )
}
