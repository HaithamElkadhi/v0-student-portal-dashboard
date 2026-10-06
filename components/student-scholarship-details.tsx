"use client"

import { useCallback, useEffect, useState } from "react"
import { GraduationCap, ExternalLink, FileText, CalendarDays } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useStudentPortal } from "@/components/student-portal-context"
import DocumentsBourseForm from "@/components/bourse-documents/DocumentsBourseForm"

type Scholarship = {
  status?: string | null; type?: string | null; regionAuthority?: string | null
  payment?: string | null; submissionDate?: string | null; deadline?: string | null
  documentFolder?: string | null
}
type Dossier = {
  status: string | null; submissionDate: string | null
  filesByField: Record<string, { name: string; url: string | null }[]>
}
const documentLabels: Record<string, string> = {
  birthCertificates: "Actes de naissance", familyBooklet: "Livret de famille / Vie collective",
  propertyDocs: "Documents de propriété", nonPropertyDocs: "Attestations de non-propriété",
  balanceAttestation: "Attestations de solde", taxDeclarations: "Déclarations fiscales", otherDocuments: "Autres documents",
}
const statusInfo: Record<string, { label: string; explanation: string; style: string }> = {
  "Not Started": { label: "Demande non commencée", explanation: "Votre demande de bourse n’a pas encore été déposée. Consultez la date limite lorsqu’elle est indiquée.", style: "bg-zinc-100 text-zinc-700" },
  Submitted: { label: "Demande déposée", explanation: "Votre demande a été déposée. La décision d’attribution n’est pas encore indiquée.", style: "bg-blue-50 text-blue-700" },
  Accepted: { label: "Bourse acceptée", explanation: "Une décision favorable est enregistrée pour votre demande de bourse.", style: "bg-emerald-50 text-emerald-700" },
  Rejected: { label: "Demande refusée", explanation: "Une décision défavorable est enregistrée. Votre conseiller peut vous préciser les suites possibles.", style: "bg-red-50 text-red-700" },
  "Not Concerned": { label: "Non concerné", explanation: "Le suivi indique que vous n’êtes pas concerné par cette demande de bourse.", style: "bg-zinc-100 text-zinc-700" },
  "DDL Missed": { label: "Date limite dépassée", explanation: "Le délai de dépôt est indiqué comme dépassé dans votre suivi. Contactez votre conseiller pour connaître les suites possibles.", style: "bg-amber-50 text-amber-800" },
}
const types: Record<string, string> = { Regional: "Bourse régionale", University: "Bourse universitaire", DSU: "DSU", "Erasmus+": "Erasmus+", Other: "Autre" }
const payments: Record<string, string> = { "Not Applicable": "Non applicable", Paid: "Payé", Prepayment: "Prépaiement", "Waiting for paiement": "Paiement en attente", "Start for free": "Démarrage sans paiement" }
function date(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value.slice(0, 10) + "T12:00:00")
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}
function safeLink(value?: string | null) {
  if (!value) return null
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : null } catch { return null }
}

export default function StudentItalyScholarshipPage() {
  const { studentInfo } = useStudentPortal()
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/scholarship?email=" + encodeURIComponent(studentInfo.email))
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Impossible de charger votre suivi de bourse.")
      setScholarship(json.scholarship)
      setDossier(json.dossier)
    } catch (err) { setError(err instanceof Error ? err.message : "Impossible de charger votre suivi de bourse.") }
    finally { if (showLoading) setLoading(false) }
  }, [studentInfo.email])
  useEffect(() => { void load() }, [load])
  const rawStatus = scholarship?.status?.trim()
  const status = rawStatus ? statusInfo[rawStatus] || { label: rawStatus, explanation: "Voici le statut actuellement enregistré pour votre demande.", style: "bg-zinc-100 text-zinc-700" } : null
  const folder = safeLink(scholarship?.documentFolder)
  const entries = [
    { label: "Type de bourse", value: scholarship?.type ? types[scholarship.type.trim()] || scholarship.type : null, hint: "La catégorie de bourse suivie pour votre dossier." },
    { label: "Région / organisme", value: scholarship?.regionAuthority, hint: "L’organisme chargé de votre demande de bourse." },
    { label: "Paiement du dossier bourse", value: scholarship?.payment ? payments[scholarship.payment.trim()] || scholarship.payment : null, hint: "Le suivi du paiement lié au dossier ; ce statut ne confirme pas le versement de la bourse." },
    { label: "Demande déposée le", value: date(scholarship?.submissionDate), hint: "La date de dépôt enregistrée pour votre demande." },
  ].filter(entry => entry.value)
  const deadline = date(scholarship?.deadline)
  const documentGroups = Object.entries(dossier?.filesByField || {}).filter(([key, files]) => documentLabels[key] && files.length > 0)
  return <div className="space-y-4">
    <Card className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-700"><GraduationCap className="h-5 w-5" /></span>
        <div><h1 className="text-lg font-semibold text-zinc-900">Bourse</h1><p className="mt-1 text-sm text-zinc-500">Retrouvez l’avancement de votre demande et les documents de votre dossier.</p></div>
      </div>
    </Card>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<Button variant="outline" onClick={() => void load()} disabled={loading}>Réessayer</Button></div>}
    {loading ? <Card className="rounded-2xl border-zinc-200 p-5 text-sm text-zinc-500" role="status">Chargement du suivi de bourse…</Card> : !error && <>
      <Card className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-zinc-900">Votre demande de bourse</h2>
        {status ? <div className="mt-4"><span className={"inline-flex rounded-full px-3 py-1 text-xs font-semibold " + status.style}>{status.label}</span><p className="mt-2 text-sm leading-relaxed text-zinc-600">{status.explanation}</p></div> : <p className="mt-3 text-sm text-zinc-500">L’avancement de votre demande sera affiché ici dès sa mise à jour par votre conseiller.</p>}
        {entries.length > 0 && <dl className="mt-5 grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2">{entries.map(entry => <div key={entry.label}><dt className="text-xs font-medium text-zinc-500">{entry.label}</dt><dd className="mt-1 text-sm font-semibold text-zinc-900">{entry.value}</dd><p className="mt-1 text-xs leading-relaxed text-zinc-500">{entry.hint}</p></div>)}</dl>}
        {deadline && <div className="mt-5 flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" /><div><p className="text-sm font-semibold text-zinc-900">Date limite de dépôt : {deadline}</p><p className="mt-1 text-xs leading-relaxed text-zinc-500">Cette date correspond au dernier délai enregistré pour déposer votre demande.</p></div></div>}
        {folder && <a href={folder} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Consulter mon dossier de bourse<ExternalLink className="h-3.5 w-3.5" /></a>}
      </Card>
      <Card className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-zinc-900">Dossier bourse</h2>{documentGroups.length > 0 && dossier?.status && <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">Dossier : {dossier.status}</span>}</div>
        {documentGroups.length === 0 && <p className="mb-4 text-sm text-zinc-500">Vous n’avez pas encore ajouté de documents à votre dossier bourse.</p>}
        <div className="space-y-4">{documentGroups.map(([key, files]) => <div key={key}><h3 className="mb-2 text-xs font-medium text-zinc-500">{documentLabels[key]}</h3><ul className="space-y-2">{files.map((file, index) => {
          const href = safeLink(file.url)
          return <li key={file.name + index} className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5"><FileText className="h-4 w-4 shrink-0 text-zinc-400" />{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center justify-between gap-3 text-sm text-zinc-700 hover:underline"><span className="break-words">{file.name || "Document"}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <span className="break-words text-sm text-zinc-700">{file.name || "Document"}</span>}</li>
        })}</ul></div>)}</div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 rounded-lg bg-[var(--jx-terracotta)] text-white hover:opacity-90">Ajouter mon dossier bourse</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl border-zinc-200 bg-white p-5 sm:p-6">
            <DialogTitle className="sr-only">Ajouter mon dossier bourse</DialogTitle>
            <DialogDescription className="sr-only">Complétez vos informations et envoyez vos documents de bourse.</DialogDescription>
            <DocumentsBourseForm onSubmitted={() => void load(false)} />
          </DialogContent>
        </Dialog>
      </Card>
    </>}
  </div>
}
