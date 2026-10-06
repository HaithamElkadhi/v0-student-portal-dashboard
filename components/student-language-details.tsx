"use client"

import { useEffect, useState } from "react"
import { ExternalLink, FileText, Languages, X } from "lucide-react"
import { useStudentPortal } from "@/components/student-portal-context"
import { Button } from "@/components/ui/button"

function certificates(value: unknown): { name: string; url: string }[] {
  return (Array.isArray(value) ? value : value ? [value] : []).flatMap(item => {
    const raw = typeof item === "string" ? item : item && typeof item === "object" && "url" in item ? String(item.url) : ""
    try {
      const url = new URL(raw)
      if (!["http:", "https:"].includes(url.protocol)) return []
      return [{ name: item && typeof item === "object" && "filename" in item ? String(item.filename) : "Consulter mon certificat", url: url.href }]
    } catch { return [] }
  })
}

type LanguageData = { score: string; certificates: { name: string; url: string }[] }
function LanguageCard({ id, title, existing = [], initialScore, onSave }: { id: "ef" | "ielts"; title: string; existing?: { name: string; url: string }[]; initialScore: string; onSave: (kind: string, score: string, file: File | null) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null)
  const [score, setScore] = useState(initialScore)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  useEffect(() => { setScore(initialScore) }, [initialScore])
  const [error, setError] = useState("")
  const hasDocument = existing.length > 0
  return <section className="rounded-xl border border-zinc-200 bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900"><Languages className="h-4 w-4 text-zinc-500" />{title}</h3>
      <span className={"rounded-full px-2.5 py-1 text-xs font-medium " + (hasDocument ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600")}>{hasDocument ? "Certificat ajouté" : "Certificat non ajouté"}</span>
    </div>
    {id === "ef" && <a href="https://www.efset.org/ef-set-50/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"><ExternalLink className="h-4 w-4" />Passer le test EF</a>}
    <div className="mt-4 space-y-2">
      {existing.map(document => <a key={document.url} href={document.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700"><FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{document.name}</span><ExternalLink className="ml-auto h-4 w-4 shrink-0" /></a>)}
      {file && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1 break-words">{file.name}</span><button type="button" onClick={() => setFile(null)} aria-label={"Retirer le certificat " + title} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-emerald-100"><X className="h-4 w-4" /></button></div>}
      <label htmlFor={id + "-certificate"} className="block text-xs font-medium text-zinc-600">{file ? "Remplacer mon certificat" : "Ajouter mon certificat"}</label>
      <input id={id + "-certificate"} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={event => {
        const selected = event.target.files?.[0]
        event.target.value = ""
        if (!selected) return
        if (!/\.(pdf|jpe?g|png)$/i.test(selected.name) || !["application/pdf", "image/jpeg", "image/png"].includes(selected.type)) { setError("Choisissez un fichier PDF, JPG ou PNG."); return }
        if (selected.size > 5 * 1024 * 1024) { setError("Le fichier doit faire au maximum 5 Mo."); return }
        setError(""); setSuccess(false); setFile(selected)
      }} className="block min-h-11 w-full min-w-0 rounded-lg border border-zinc-200 p-2 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-xs file:font-medium" />
      <p className="text-xs text-zinc-500">PDF, JPG ou PNG · 5 Mo maximum</p>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
    <div className="mt-4"><label htmlFor={id + "-score"} className="mb-1.5 block text-xs font-medium text-zinc-600">Mon score {id === "ef" ? "EF (sur 100)" : "IELTS ou équivalent"}</label><input id={id + "-score"} type={id === "ef" ? "number" : "text"} min={id === "ef" ? 0 : undefined} max={id === "ef" ? 100 : undefined} step={id === "ef" ? 1 : undefined} value={score} onChange={event => { setScore(event.target.value); setSuccess(false) }} placeholder={id === "ef" ? "Ex. 72" : "Ex. IELTS 6.5 ou TOEFL 90"} className="min-h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--jx-terracotta)]/30" /></div>
    <Button type="button" disabled={saving} className="mt-4 min-h-11 w-full sm:w-auto" onClick={async () => {
      if (id === "ef" && score !== "" && (!/^\d+$/.test(score) || Number(score) > 100)) { setError("Le score EF doit être un entier entre 0 et 100."); return }
      setSaving(true); setError(""); setSuccess(false)
      try { await onSave(id, score, file); setFile(null); setSuccess(true) } catch (error) { setError(error instanceof Error ? error.message : "Impossible d’enregistrer.") } finally { setSaving(false) }
    }}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
    {success && <p role="status" className="mt-2 text-xs text-emerald-700">Enregistré dans votre dossier.</p>}
  </section>
}

export default function StudentLanguageDetails({ certificate }: { certificate?: unknown }) {
  const { studentInfo, reloadFromApi } = useStudentPortal()
  const [data, setData] = useState<{ ef: LanguageData; ielts: LanguageData } | null>(null)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setData(null); setError("")
    fetch("/api/student-language?" + new URLSearchParams({ email: studentInfo.email, folderId: studentInfo.folderId }), { signal: controller.signal })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error); return result })
      .then(setData).catch(error => { if (!controller.signal.aborted) setError(error.message) })
    return () => controller.abort()
  }, [studentInfo.email, studentInfo.folderId, retry])
  async function save(kind: string, score: string, file: File | null) {
    const form = new FormData()
    form.set("email", studentInfo.email); form.set("folderId", studentInfo.folderId)
    form.set("kind", kind); form.set("score", score)
    if (file) form.set("file", file)
    const response = await fetch("/api/student-language", { method: "POST", body: form })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    setData(result)
    void reloadFromApi()
  }
  if (error) return <div role="alert" className="space-y-3 text-sm text-red-700"><p>{error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Réessayer</Button></div>
  if (!data) return <p className="py-6 text-sm text-zinc-500">Chargement de vos certificats…</p>
  const savedUrls = new Set([...data.ef.certificates, ...data.ielts.certificates].map(file => file.url))
  const legacy = certificates(certificate).filter(file => !savedUrls.has(file.url))
  return <div className="space-y-4">
    <LanguageCard id="ef" title="EF" existing={data.ef.certificates} initialScore={data.ef.score} onSave={save} />
    <LanguageCard id="ielts" title="IELTS ou équivalent" existing={data.ielts.certificates} initialScore={data.ielts.score} onSave={save} />
    {legacy.length > 0 && <div className="rounded-xl border border-zinc-200 p-4"><h3 className="mb-2 text-sm font-medium">Autres certificats de langue déjà présents</h3>{legacy.map(file => <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer" className="block break-words py-2 text-sm text-zinc-600 underline">{file.name}</a>)}</div>}
  </div>
}
