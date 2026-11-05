"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDays, UserRound, GraduationCap, Wallet, Sparkles, FileText, type LucideIcon } from "lucide-react"

const groupStyles: Record<string, { icon: LucideIcon; color: string }> = {
  "Fiche d’orientation": { icon: CalendarDays, color: "bg-sky-100 text-sky-800" },
  "Profil étudiant": { icon: UserRound, color: "bg-blue-100 text-blue-700" },
  "Préférences d’études": { icon: GraduationCap, color: "bg-violet-100 text-violet-700" },
  "Situation financière": { icon: Wallet, color: "bg-emerald-100 text-emerald-800" },
  Services: { icon: Sparkles, color: "bg-amber-100 text-amber-800" },
}
type Group = { title: string; fields: { label: string; value: unknown }[] }
function text(value: unknown): string {
  if (value == null || value === "") return "Non renseigné"
  if (Array.isArray(value)) return value.length ? value.map(text).join(" · ") : "Non renseigné"
  if (typeof value === "boolean") return value ? "Oui" : "Non"
  return typeof value === "object" ? "Non renseigné" : String(value)
}
function formattedValue(label: string, value: unknown): string {
  if (typeof value === "string" && ["Date de fiche d’orientation", "Valable jusqu’au"].includes(label) && /^\d{4}-\d{2}-\d{2}/.test(value) && Number.isFinite(Date.parse(value))) {
    return new Date(value.length === 10 ? value + "T12:00:00+01:00" : value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Tunis" })
  }
  if (label === "Budget disponible (€)" && typeof value === "number") return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
  return text(value)
}

export default function StudentProposalDetails({ prospectId }: { prospectId?: string }) {
  const [groups,setGroups] = useState<Group[] | null>(null)
  const [error,setError] = useState(false)
  const [notFound,setNotFound] = useState(false)
  const [retry,setRetry] = useState(0)
  useEffect(() => {
    let cancelled = false
    setGroups(null); setError(false); setNotFound(false)
    fetch("/api/proposal-details?prospectId=" + encodeURIComponent(prospectId || ""))
      .then(async res => { if (res.status === 404) { if (!cancelled) setNotFound(true); return null }; if (!res.ok) throw new Error(); return res.json() })
      .then(data => { if (data && !cancelled) { if (!Array.isArray(data.groups)) throw new Error(); setGroups(data.groups) } })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [prospectId,retry])
  return <div className="space-y-5">
    {error ? <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-800"><p>Impossible de charger votre fiche d’orientation.</p><Button variant="outline" className="mt-3 bg-white" onClick={() => setRetry(value => value + 1)}>Réessayer</Button></div>
      : notFound || groups?.length === 0 ? <div className="rounded-xl border border-dashed border-blue-200 bg-white p-6 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-blue-500" aria-hidden="true" /><p className="font-semibold text-[#173B65]">Votre fiche sera bientôt disponible</p><p className="mt-2 text-sm leading-relaxed text-slate-500">Les informations de votre projet apparaîtront ici dès leur enregistrement par votre conseiller.</p></div>
      : !groups ? <div role="status" className="space-y-4"><span className="sr-only">Chargement de votre fiche d’orientation…</span>{[0, 1, 2].map(index => <div key={index} className="h-36 animate-pulse rounded-xl border border-slate-100 bg-white p-5"><div className="h-4 w-1/3 rounded bg-slate-100" /><div className="mt-6 h-3 w-2/3 rounded bg-slate-100" /><div className="mt-3 h-3 w-1/2 rounded bg-slate-100" /></div>)}</div>
      : <>{groups.map(group => {
        const { icon: Icon, color } = groupStyles[group.title] || { icon: FileText, color: "bg-slate-100 text-slate-700" }
        return <section key={group.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5"><span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " + color}><Icon className="h-4.5 w-4.5" aria-hidden="true" /></span><h3 className="text-sm font-semibold text-[#173B65]">{group.title === "Fiche d’orientation" ? "Les repères de votre fiche" : group.title}</h3></div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5">{group.fields.map(field => {
            const value = formattedValue(field.label, field.value)
            return <div key={field.label} className={"min-w-0 " + (["Parcours académique", "Parcours linguistique", "Votre demande", "Notes sur les services", "Détails du soutien"].includes(field.label) ? "sm:col-span-2" : "")}><dt className="text-xs font-medium text-slate-500">{field.label}</dt><dd className={"mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed " + (value === "Non renseigné" ? "italic text-slate-400" : "font-medium text-slate-800")}>{value}</dd></div>
          })}</dl>
        </section>
      })}<p className="px-1 text-xs leading-relaxed text-slate-500">Pour compléter ou actualiser les informations de votre projet, contactez votre conseiller JEEXPERT.</p></>}
  </div>
}
