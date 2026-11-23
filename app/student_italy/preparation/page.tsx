"use client"

import Link from "next/link"
import { useStudentPreparation } from "@/components/use-student-preparation"
import { ArrowLeft, ArrowRight, Building2, Upload } from "lucide-react"

const portal = "/student_italy"
const guide = `${portal}/guide`
const documents = `${portal}/documents`

const stepDefinitions = [
  {
    title: "Identifiants",
    description: "Retrouvez les comptes et accès créés pour vous par JEEXPERT.",
    links: [{ href: `${portal}/preparation/identifiants`, label: "Consulter mes identifiants" }],
  },
  {
    title: "Preparation meeting",
    description: "Votre rendez-vous avec votre conseiller pour préparer les prochaines démarches.",
    links: [{ href: `${portal}/rendez-vous`, label: "Consulter les rendez-vous" }],
  },
  {
    title: "Liste des documents",
    description: "Vérifiez les pièces demandées par votre conseiller et celles qui restent à fournir.",
    links: [{ href: "/listedocuments", label: "Consulter ma liste" }],
  },
  {
    title: "Mousad9a",
    description: "Vérifiez quels diplômes et relevés doivent être authentifiés pour votre dossier.",
    links: [{ href: `${portal}/preparation/mousad9a`, label: "Consulter le guide Mousad9a" }],
  },
  {
    title: "Traduction",
    description: "Confirmez les pièces à traduire et la langue attendue avant de contacter un traducteur assermenté.",
    links: [{ href: "/traduction", label: "Voir les étapes et les traducteurs" }],
  },
  {
    title: "IELTS, CISIA ou équivalent",
    description: "Vérifiez quel justificatif de langue ou test d’admission votre formation exige et quels équivalents elle accepte.",
    links: [{ href: `${portal}/preparation/justificatifs`, label: "Ajouter mes justificatifs" }],
  },
  {
    title: "Déclaration de valeur ou CIMEA",
    description: "Vérifiez auprès de votre établissement quel justificatif de diplôme il accepte.",
    links: [
      { href: `${portal}/preparation/declaration-de-valeur`, label: "Déclaration de valeur" },
      { href: `${guide}/cimea`, label: "CIMEA" },
    ],
  },
]

const depositOptions = [
  { href: `${documents}?tab=mine`, title: "En ligne", description: "Téléversez vos fichiers dans le portail.", icon: Upload },
  { href: `${portal}/rendez-vous`, title: "Au bureau", description: "Prenez rendez-vous pour apporter votre dossier.", icon: Building2 },
]

const marker = "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4FB] text-sm font-semibold text-[#173B65]"
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65]"

export default function StudentPreparationPage() {
  const { preparation, error, refresh } = useStudentPreparation()
  const states = preparation ? [
    preparation.identity,
    preparation.meeting,
    preparation.documents,
    preparation.mousad9a,
    preparation.translation,
    preparation.test,
    preparation.dv,
  ] : []
  const notes: Record<number, string> = preparation ? {
    1: preparation.meeting.note, 5: preparation.test.note, 6: preparation.dv.note,
  } : {}
  return (
    <main className="mx-auto w-full max-w-4xl">
      <Link href={portal} className={`inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline ${focus}`}>
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour à l’accueil
      </Link>

      <section aria-labelledby="preparation-title" className="mt-3 rounded-xl border border-[#D9E2EC] bg-white p-4 sm:p-7">
        <h1 id="preparation-title" className="text-2xl font-semibold tracking-tight text-[#173B65] sm:text-3xl">Préparation du dossier</h1>
        <p className="mt-2 text-sm text-slate-600">Votre progression et les indications de votre conseiller.</p>
        <button type="button" onClick={refresh} className="mt-2 min-h-11 rounded text-sm font-medium text-[#173B65] underline underline-offset-4 focus-visible:outline-2">Actualiser ma préparation</button>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {!preparation && !error && <p role="status" className="mt-4 text-sm text-slate-600">Chargement de votre préparation…</p>}
        {preparation && <>
        <ol className="relative mt-6 before:absolute before:bottom-6 before:left-[19px] before:top-5 before:w-0.5 before:bg-[#80C4EA] before:content-['']">
          {stepDefinitions.map(({ title, description, links }, index) => index === 5 && preparation.test.type === "Cacher" ? null : (
            <li key={title} className="flex items-start gap-3 pb-5 sm:gap-4">
              <span className={marker + (states[index].done ? " !bg-emerald-600 !text-white" : "")} aria-hidden="true">{index}</span>
              <div className="relative min-w-0 flex-1 rounded-lg border border-[#D9E2EC] p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-[#173B65]">{index === 5 ? preparation.test.type || title : title}</h2>
                  <span className={"rounded-full px-2.5 py-1 text-xs font-medium " + (states[index].done ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600")}>
                    {index === 6 ? preparation.dv.status : states[index].done ? "Fait" : "Non fait"}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                {index === 0 && preparation.identity.applicationEmail && <p className="mt-2 break-all text-sm text-[#173B65]">{preparation.identity.applicationEmail}</p>}
                {index === 2 && preparation.documents.error && <p className="mt-2 text-sm text-amber-800">Votre conseiller doit vérifier la liste des documents.</p>}
                {notes[index] && <div className="mt-3 rounded-lg bg-[#F4F7FB] p-3">
                  <p className="text-xs font-medium text-[#173B65]">Note de votre conseiller</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{notes[index]}</p>
                </div>}
                <div className="mt-1 flex flex-wrap gap-x-5">
                  {links.map(({ href, label }) => (
                    <Link key={href} href={href} className={`inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-[#173B65] underline underline-offset-4 ${focus} ${links.length === 1 ? "after:absolute after:inset-0 after:rounded-lg" : ""}`}>
                      {label} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
          <li className="relative flex items-start gap-3 bg-white sm:gap-4">
            <span className={marker + (preparation.deposit.done ? " !bg-emerald-600 !text-white" : "")} aria-hidden="true">7</span>
            <div className="min-w-0 flex-1 rounded-lg border border-[#D9E2EC] p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[#173B65]">Dépôt du dossier</h2>
                <span className={"rounded-full px-2.5 py-1 text-xs font-medium " + (preparation.deposit.done ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600")}>{preparation.deposit.done ? "Fait" : "Non fait"}</span>
              </div>
              {preparation.deposit.note && <div className="mt-3 rounded-lg bg-[#F4F7FB] p-3">
                <p className="text-xs font-medium text-[#173B65]">Note de votre conseiller</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{preparation.deposit.note}</p>
              </div>}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {depositOptions.map(({ href, title, description, icon: Icon }) => (
                  <Link key={href} href={href} className={`flex items-start gap-2 rounded-lg border border-[#D9E2EC] bg-[#F4F7FB] p-3 text-[#173B65] hover:border-[#80C4EA] hover:bg-[#E8F4FB] ${focus}`}>
                    <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </li>
        </ol>
        </>}
      </section>
    </main>
  )
}
