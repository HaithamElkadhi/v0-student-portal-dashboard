import Link from "next/link"
import { ArrowLeft, Phone } from "lucide-react"
import { swornTranslators } from "@/app/student_italy/guide/sworn-translators"

const recommendedName = "Abdeljelil Chaieb"
const recommended = swornTranslators.flatMap(({ contacts }) => contacts).find(({ name }) => name === recommendedName)
const panel = "rounded-xl border border-[#D9E2EC] bg-white p-5 sm:p-7"
const link = "inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
const steps = [
  {
    title: "Faites apostiller le document original",
    text: "Apportez l’original à un notaire tunisien (عدل إشهاد). L’apostille authentifie la signature ou le cachet officiel du document.",
  },
  {
    title: "Faites traduire le document en italien",
    text: "Remettez l’original avec ses cachets et son apostille à un traducteur assermenté. Vérifiez que le nom et le prénom sur la traduction correspondent à ceux du passeport.",
  },
  {
    title: "Faites apostiller la traduction",
    text: "Apportez la traduction signée au notaire. Cette deuxième apostille authentifie la signature du traducteur assermenté.",
  },
]

export default function TranslationPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-5">
      <Link href="/student_italy/preparation" className={link}>
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour à la préparation
      </Link>
      <section aria-labelledby="translation-title" className={panel}>
        <h1 id="translation-title" className="text-2xl font-semibold text-[#173B65] sm:text-3xl">Traduction et apostille</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Si la mousad9a est demandée pour votre document, faites-la avant de suivre ces trois étapes.
        </p>
        <ol className="mt-5 list-decimal space-y-4 pl-5 marker:font-semibold marker:text-[#173B65]">
          {steps.map(({ title, text }) => (
            <li key={title} className="pl-1">
              <h2 className="font-semibold text-[#173B65]">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{text}</p>
            </li>
          ))}
        </ol>
        <a className={link + " mt-3"} href="https://ambtunisi.esteri.it/fr/servizi-consolari-e-visti/servizi-per-il-cittadino-italiano/traduzione-e-legalizzazione-dei-documenti/">
          Consignes de l’Ambassade d’Italie à Tunis
        </a>
      </section>

      <section aria-labelledby="translation-directory" className={panel}>
        <h2 id="translation-directory" className="text-xl font-semibold text-[#173B65]">Traducteurs assermentés en italien</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">Avant de vous déplacer, appelez le traducteur pour confirmer les pièces à apporter, le tarif et le délai.</p>
        {recommended && (
          <div className="mt-4 rounded-lg border border-[#80C4EA] bg-[#E8F4FB] px-4 pt-3">
            <p className="text-xs font-medium text-[#173B65]">Recommandé par JEEXPERT</p>
            <h3 className="mt-1 font-semibold text-[#173B65]">{recommended.name}</h3>
            <p className="text-sm text-slate-700">{recommended.city}</p>
            <a className={link} href={`tel:+216${recommended.phone.replaceAll(" ", "")}`}>
              <Phone className="size-4" aria-hidden="true" /> Appeler le +216 {recommended.phone}
            </a>
          </div>
        )}
        <div className="mt-5 space-y-5">
          {swornTranslators.map(({ area, contacts }) => (
            <section key={area}>
              <h3 className="text-sm font-semibold text-[#173B65]">{area}</h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {contacts.filter(({ name }) => name !== recommendedName).map(({ name, city, phone }) => (
                  <li key={name} className="min-w-0 rounded-lg border border-[#D9E2EC] px-3 pt-3">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="mt-1 text-xs text-slate-600">{city}</p>
                    <a className={link} href={`tel:+216${phone.replaceAll(" ", "")}`} aria-label={`Appeler ${name} au +216 ${phone}`}>
                      <Phone className="size-4" aria-hidden="true" /> +216 {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <a className={link + " mt-3"} href="https://ambtunisi.esteri.it/wp-content/uploads/2024/10/Lista-traduttori-25-10-2024.pdf">
          Liste des traducteurs publiée par l’Ambassade (PDF)
        </a>
      </section>
    </main>
  )
}
