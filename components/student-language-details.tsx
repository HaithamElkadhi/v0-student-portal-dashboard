"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, FileText, Plus, Languages, Info, Upload, CheckCircle2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudentPortal } from "@/components/student-portal-context"
import { languageOptions, type Language, type LanguageProof } from "@/lib/language-proofs"

const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#173B65] focus:ring-2 focus:ring-[#173B65]/15 disabled:bg-slate-50"
const empty = { score: "", date: "", institution: "", detail: "" }
export default function StudentLanguageDetails({ certificate }: { certificate?: unknown }) {
  const { studentInfo, reloadFromApi } = useStudentPortal()
  const formRef = useRef<HTMLElement>(null)
  const [proofs, setProofs] = useState<LanguageProof[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [retry, setRetry] = useState(0)
  const [language, setLanguage] = useState<Language>("english")
  const [choice, setChoice] = useState("")
  const [efVersion, setEfVersion] = useState("")
  const [id, setId] = useState("")
  const [values, setValues] = useState(empty)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const type = choice === "ef" ? efVersion : choice
  const option = languageOptions.find(o => o.id === type)
  const selectedProof = proofs.find(p => p.id === id)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setLoadError("")
    fetch("/api/student-language?" + new URLSearchParams({ email: studentInfo.email, folderId: studentInfo.folderId }), { signal: controller.signal })
      .then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.error); return data.proofs })
      .then(setProofs).catch(error => { if (!controller.signal.aborted) setLoadError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [studentInfo.email, studentInfo.folderId, retry])
  function reset() { setId(""); setValues(empty); setFile(null); setError(""); setSuccess(false) }
  function edit(proof: LanguageProof) {
    reset(); setId(proof.id); setLanguage(proof.language)
    setChoice(proof.type.startsWith("ef") ? "ef" : proof.type)
    setEfVersion(proof.type.startsWith("ef") ? proof.type : "")
    setValues({ score: proof.score, date: proof.date, institution: proof.institution, detail: proof.detail })
    formRef.current?.scrollIntoView({ block: "start" })
  }
  async function save() {
    if (!option) return
    setSaving(true); setError(""); setSuccess(false)
    try {
      const form = new FormData()
      Object.entries({ email: studentInfo.email, folderId: studentInfo.folderId, id, type, ...values }).forEach(([key, value]) => form.set(key, value))
      if (file) form.set("file", file)
      const res = await fetch("/api/student-language", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) { if (data.id) setId(data.id); throw new Error(data.error) }
      const saved: LanguageProof = data.proof
      setProofs(previous => [...previous.filter(p => p.id !== saved.id), saved])
      setId(saved.id); setFile(null); setSuccess(true)
      void reloadFromApi()
    } catch (error) { setError(error instanceof Error ? error.message : "Impossible d’enregistrer.") } finally { setSaving(false) }
  }
  if (loading) return <div role="status" className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">Chargement des justificatifs…</p><div className="h-24 animate-pulse rounded-lg bg-slate-100" /><div className="h-24 animate-pulse rounded-lg bg-slate-100" /></div>
  if (loadError) return <div role="alert"><p className="text-sm text-red-700">{loadError}</p><Button className="mt-3" variant="outline" onClick={() => setRetry(v => v + 1)}>Réessayer</Button></div>
  const links = choice === "ef" ? languageOptions.filter(o => o.id.startsWith("ef")) : option ? [option] : []
  const knownUrls = new Set(proofs.flatMap(p => p.documents.map(d => d.url)))
  const legacy = (Array.isArray(certificate) ? certificate : []).filter((item): item is { url: string; filename?: string } => !!item && typeof item === "object" && typeof item.url === "string" && /^https?:\/\//.test(item.url) && !knownUrls.has(item.url))
  return <div className="space-y-5">
    <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" /><p className="text-sm leading-relaxed text-sky-900">Choisissez un test ou une attestation correspondant à la langue de votre formation. Les justificatifs acceptés et le niveau demandé dépendent de votre université.</p></div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
    <section ref={formRef} className="min-w-0 scroll-mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#173B65]"><Plus className="h-4 w-4" aria-hidden="true" /></span><h3 className="text-base font-semibold text-[#173B65]">{id ? "Compléter mon justificatif" : "Ajouter un justificatif"}</h3></div>{id && <Button variant="outline" disabled={saving} onClick={() => { reset(); setChoice(""); setEfVersion("") }} className="min-h-11 gap-1 text-xs"><Plus className="h-4 w-4" aria-hidden="true" />Nouveau</Button>}</div>
      <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">01 · Choisir la langue et le justificatif</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="proof-language" className="mb-1.5 block text-xs font-medium">Langue</label><select id="proof-language" disabled={!!id} value={language} onChange={e => { setLanguage(e.target.value as Language); setChoice(""); setEfVersion(""); reset() }} className={inputClass}><option value="english">Anglais</option><option value="italian">Italien</option></select></div>
          <div><label htmlFor="proof-type" className="mb-1.5 block text-xs font-medium">Type de justificatif</label><select id="proof-type" disabled={!!id} value={choice} onChange={e => { setChoice(e.target.value); setEfVersion(""); reset() }} className={inputClass}><option value="">Choisir un justificatif</option>{language === "english" && <option value="ef">EF SET</option>}{languageOptions.filter(o => o.language === language && !o.id.startsWith("ef")).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select></div>
        </div>
        {choice === "ef" && <div><label htmlFor="ef-version" className="mb-1.5 block text-xs font-medium">Version du test EF</label><select id="ef-version" disabled={!!id} value={efVersion} onChange={e => { setEfVersion(e.target.value); setValues(empty); setFile(null); setError(""); setSuccess(false) }} className={inputClass}><option value="">Choisir la durée</option><option value="ef50">50 minutes — lecture et compréhension orale</option><option value="ef90">90 minutes — les quatre compétences</option></select></div>}
        {links.length > 0 && <div className="flex flex-col gap-2">{links.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"><ExternalLink className="h-4 w-4 shrink-0" />{choice === "ef" ? "Passer le test " + link.label : link.studies ? "Informations sur ce justificatif" : link.id.startsWith("internal") || link.id.startsWith("other") ? "Consulter les exigences de langue (exemple universitaire)" : "Informations sur ce test"}</a>)}</div>}
        {option?.id.startsWith("internal") && <p className="text-xs text-zinc-500">Consultez l’appel à candidatures de votre université pour le lien d’inscription et les modalités ; le lien ci-dessus est un exemple général.</p>}
        {option?.studies && <p className="text-xs text-zinc-500">Déposez le diplôme et/ou l’attestation officielle précisant la langue d’enseignement. Avoir étudié dans un pays ne suffit pas à garantir une dispense.</p>}
        {option && <>
          <h4 className="border-t border-slate-100 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">02 · Ajouter votre résultat et votre document</h4>
          {!option.studies && <div><label htmlFor="proof-score" className="mb-1.5 block text-xs font-medium">{type.startsWith("ef") ? "Score EF (sur 100)" : type === "ielts" ? "Score IELTS (sur 9)" : "Score ou niveau obtenu"}</label><input id="proof-score" value={values.score} onChange={e => { setValues({ ...values, score: e.target.value }); setSuccess(false) }} maxLength={100} placeholder={type.startsWith("ef") ? "Ex. 72" : type === "ielts" ? "Ex. 6.5" : "Ex. B2, C1 ou le score indiqué sur le document"} className={inputClass} /></div>}
          <div><label htmlFor="proof-file" className="mb-1.5 block text-xs font-medium">Ajouter un document</label><input id="proof-file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
            const next = e.target.files?.[0]; e.target.value = ""; if (!next) return
            if (!next.size || next.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(next.type) || !/\.(pdf|jpe?g|png)$/i.test(next.name)) { setError("Choisissez un PDF, JPG ou PNG de 5 Mo maximum."); return }
            setFile(next); setError(""); setSuccess(false)
          }} className="block min-h-11 w-full min-w-0 rounded-lg border border-zinc-200 p-2 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-zinc-100 file:p-2" /><p className="mt-1 text-xs text-zinc-500">PDF, JPG ou PNG · 5 Mo maximum. Vous pouvez ajouter plusieurs documents en enregistrant chacun.</p>{file && <div className="mt-2 flex items-center justify-between gap-2 text-xs"><span className="min-w-0 break-words">{file.name} — prêt à enregistrer</span><Button variant="ghost" onClick={() => setFile(null)}>Retirer</Button></div>}</div>
          <p className={"text-xs " + (selectedProof?.documents.length ? "text-emerald-700" : "text-zinc-500")}>{selectedProof?.documents.length ? "Document déposé" : "À compléter — aucun document enregistré"}</p>
          <Button type="button" onClick={save} className="min-h-11 w-full gap-2 bg-[#173B65] text-white hover:bg-[#123052]"><Upload className="h-4 w-4" aria-hidden="true" />{saving ? "Enregistrement…" : "Enregistrer mon justificatif"}</Button>
        </>}
      </fieldset>
      {!choice && <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-500">Sélectionnez un justificatif pour afficher les champs et les documents à joindre.</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}{success && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />Justificatif enregistré dans votre dossier.</p>}
    </section>
    <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4"><h3 className="text-base font-semibold text-[#173B65]">Mes justificatifs</h3><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#173B65]">{proofs.length + legacy.length}</span></div>
      {!proofs.length && !legacy.length && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><Languages className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" /><p className="text-sm font-medium text-slate-700">Votre premier justificatif</p><p className="mt-2 text-xs leading-relaxed text-slate-500">Ajoutez un test ou une attestation pour le retrouver ici et compléter votre dossier.</p></div>}
      {proofs.map(proof => <article key={proof.id} className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className={"rounded-full px-2.5 py-1 text-xs font-medium " + (proof.language === "italian" ? "bg-violet-100 text-violet-800" : "bg-sky-100 text-sky-800")}>{proof.language === "italian" ? "Italien" : "Anglais"}</span><span className={"rounded-full px-2.5 py-1 text-xs font-medium " + (proof.documents.length ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{proof.documents.length ? "Document déposé" : "À compléter"}</span></div>
        <h4 className="break-words text-sm font-semibold text-[#173B65]">{proof.type === "ef_legacy" ? "EF SET (version non renseignée)" : languageOptions.find(o => o.id === proof.type)?.label ?? proof.type}</h4>
        {proof.score && <div className="rounded-lg bg-white px-3 py-2"><p className="text-xs text-slate-500">Score / niveau</p><p className="mt-1 text-lg font-semibold text-[#173B65]">{proof.score}{proof.type.startsWith("ef") ? <span className="text-xs font-normal text-slate-500"> / 100</span> : proof.type === "ielts" ? <span className="text-xs font-normal text-slate-500"> / 9</span> : null}</p></div>}
        {proof.documents.map(doc => <a key={doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#173B65] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"><FileText className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1 break-words">{doc.name}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></a>)}
        {!proof.legacy && <Button variant="outline" className="min-h-11 w-full gap-2 bg-white text-[#173B65]" disabled={saving} onClick={() => edit(proof)}><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Compléter ce justificatif</Button>}
      </article>)}
      {legacy.map(doc => <a key={doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-xs font-medium text-[#173B65] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"><FileText className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1 break-words">{doc.filename ?? "Autre certificat existant"}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></a>)}
    </section>
    </div>
  </div>
}
