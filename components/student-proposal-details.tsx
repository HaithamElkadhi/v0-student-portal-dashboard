"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
type Group = { title: string; fields: { label: string; value: unknown }[] }
function text(value: unknown): string {
  if (value == null || value === "") return "Non renseigné"
  if (Array.isArray(value)) return value.length ? value.map(text).join(" · ") : "Non renseigné"
  if (typeof value === "boolean") return value ? "Oui" : "Non"
  return typeof value === "object" ? "Non renseigné" : String(value)
}
export default function StudentProposalDetails({ prospectId }: { prospectId?: string }) {
  const [groups,setGroups] = useState<Group[] | null>(null)
  const [error,setError] = useState(false)
  const [retry,setRetry] = useState(0)
  useEffect(() => {
    let cancelled = false
    setGroups(null); setError(false)
    fetch("/api/proposal-details?prospectId=" + encodeURIComponent(prospectId || ""))
      .then(async res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => { if (!cancelled) setGroups(data.groups) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [prospectId,retry])
  if (error) return <div role="alert" className="space-y-3 text-sm text-red-700"><p>Impossible de charger votre fiche d’orientation.</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Réessayer</Button></div>
  if (!groups) return <p role="status" className="text-sm text-zinc-500">Chargement de votre fiche d’orientation…</p>
  return <div className="space-y-4"><p className="text-sm text-zinc-500">Les informations de votre fiche d’orientation, en lecture seule.</p>{groups.map(group => <section key={group.title} className="rounded-xl border border-zinc-200 bg-white"><h3 className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">{group.title}</h3><dl className="grid gap-4 p-4 sm:grid-cols-2">{group.fields.map(field => <div key={field.label} className="min-w-0"><dt className="text-xs font-medium text-zinc-500">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-900">{text(field.value)}</dd></div>)}</dl></section>)}</div>
}
