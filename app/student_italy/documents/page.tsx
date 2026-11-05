"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import * as Tabs from "@radix-ui/react-tabs"
import { ArrowLeft, Check, FileText, Upload, Paperclip, ExternalLink, RefreshCw, X } from "lucide-react"
import { useStudentPortal } from "@/components/student-portal-context"
import type { RequiredDocument } from "@/lib/student-document-requirements"

type MyDocument = { key: string; name: string; status: string; file: { filename: string; url: string } | null }
type Data = { documents: MyDocument[] | null; requirements: RequiredDocument[] | null; documentsError: string; requirementsError: string }
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65] focus-visible:ring-offset-2 disabled:opacity-50"
const statusLabels: Record<string, string> = { Missing: "À fournir", Received: "Reçu", "Under review": "En vérification", Validated: "Validé", "Needs correction": "À corriger" }

export default function StudentDocumentsPage() {
  const { studentInfo, isRefreshing } = useStudentPortal()
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [success, setSuccess] = useState(false)
  const [revision, setRevision] = useState(0)
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadId = useRef("")
  const [tab, setTab] = useState("required")
  const endpoint = "/api/student-documents?" + new URLSearchParams({ folderId: studentInfo.folderId })
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(""); setData(null)
    async function load() {
      try {
        let response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" })
        if (response.status === 401) {
          const verified = await fetch("/api/verify-student", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: studentInfo.email, folderId: studentInfo.folderId }), signal: controller.signal })
          if (!verified.ok) throw new Error("Veuillez vous reconnecter pour consulter vos documents.")
          response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" })
        }
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        if (!controller.signal.aborted) setData(result)
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Chargement impossible.") }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void load()
    return () => controller.abort()
  }, [endpoint, studentInfo.email, studentInfo.folderId, isRefreshing, revision])

  function selectFile(selected?: File) {
    setFile(null); setSuccess(false); uploadId.current = ""
    if (!selected) return
    if (!selected.size || selected.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(selected.type) || !/\.(pdf|jpe?g|png)$/i.test(selected.name)) { setUploadError("Choisissez un PDF, JPG ou PNG de 5 Mo maximum."); return }
    setFile(selected); setUploadError("")
  }
  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (!file || !name.trim() || sending) return
    setSending(true); setUploadError(""); setSuccess(false)
    if (!uploadId.current) uploadId.current = crypto.randomUUID()
    try {
      const form = new FormData()
      form.set("name", name.trim()); form.set("file", file); form.set("uploadId", uploadId.current)
      const response = await fetch(endpoint, { method: "POST", body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setName(""); setFile(null); uploadId.current = ""; setSuccess(true)
    } catch (err) { setUploadError(err instanceof Error ? err.message : "Envoi impossible.") }
    finally { setSending(false); setRevision(value => value + 1) }
  }
  const required = data?.requirements || []
  const documents = (data?.documents || []).filter(doc => doc.file)
  return <main className="mx-auto w-full max-w-4xl space-y-5">
    <header><Link href="/student_italy" className={button + " -ml-4 text-slate-500 hover:text-[#173B65]"}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à l’accueil</Link><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#173B65]">Mes documents</h1><p className="mt-2 text-sm text-slate-500">Consultez la liste à préparer et déposez vos fichiers ici.</p></header>
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List aria-label="Documents étudiants" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/60 p-1">
        <Tabs.Trigger value="required" className="min-h-12 rounded-lg px-2 py-3 text-sm font-medium text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65] data-[state=active]:bg-white data-[state=active]:text-[#173B65] data-[state=active]:shadow-sm">Documents requis</Tabs.Trigger>
        <Tabs.Trigger value="mine" className="min-h-12 rounded-lg px-2 py-3 text-sm font-medium text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65] data-[state=active]:bg-white data-[state=active]:text-[#173B65] data-[state=active]:shadow-sm">Mes documents</Tabs.Trigger>
      </Tabs.List>
      {error && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}<button onClick={() => setRevision(v => v + 1)} className={button + " ml-2"}>Réessayer</button></div>}
      <Tabs.Content value="required" className="mt-5 space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-[#173B65]">Les documents à préparer</h2><p className="mt-1 text-sm text-slate-500">La liste préparée par votre conseiller, selon votre parcours.</p></div>{required.length > 0 && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">{required.filter(doc => doc.received).length} / {required.length} reçus</span>}</div>
          {loading ? <p role="status" className="py-6 text-sm text-slate-500">Chargement de votre liste…</p> : data?.requirementsError ? <p role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{data.requirementsError}<button onClick={() => setRevision(v => v + 1)} className={button}>Réessayer</button></p> : !error && !required.length ? <p className="rounded-lg bg-slate-50 p-5 text-sm leading-relaxed text-slate-500">Votre conseiller n’a pas encore préparé votre liste. Vous pouvez déjà déposer vos fichiers dans « Mes documents ».</p> : <ul className="divide-y divide-slate-100">{required.map(doc => <li key={doc.id} className="flex items-start gap-3 py-4"><span className={"mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full " + (doc.received ? "bg-emerald-100 text-emerald-700" : "border border-slate-200 text-slate-400")}>{doc.received ? <Check className="h-4 w-4" aria-hidden="true" /> : <FileText className="h-3.5 w-3.5" aria-hidden="true" />}</span><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium text-slate-800">{doc.name}</p><p className={"mt-1 text-xs " + (doc.received ? "text-emerald-700" : "text-slate-500")}>{doc.received ? "Reçu par votre conseiller" : "À fournir"}</p></div>{doc.urgent && !doc.received && <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">Prioritaire</span>}</li>)}</ul>}
          <button type="button" onClick={() => setTab("mine")} className={button + " mt-5 w-full bg-[#173B65] text-white hover:bg-[#123052] sm:w-auto"}><Upload className="h-4 w-4" aria-hidden="true" />Déposer mes documents</button>
        </div>
      </Tabs.Content>
      <Tabs.Content value="mine" className="mt-5 space-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]">
        <form onSubmit={send} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-[#173B65]">Ajouter un document</h2>
          <fieldset disabled={sending} className="space-y-4 disabled:opacity-60"><legend className="sr-only">Nom et fichier du document</legend>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Nom du document</span><input required maxLength={150} value={name} onChange={e => { setName(e.target.value); setSuccess(false); uploadId.current = "" }} placeholder="Ex. Passeport, diplôme du bac…" className="min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#173B65] focus:ring-2 focus:ring-[#173B65]/15" /></label>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" aria-label="Choisir le fichier à déposer" className="sr-only" tabIndex={-1} onChange={e => { selectFile(e.target.files?.[0]); e.target.value = "" }} />
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><Paperclip className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" /><div className="min-w-0 flex-1">{file ? <><p className="break-words text-sm font-medium text-slate-700">{file.name}</p><p className="mt-1 text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} Mo</p></> : <><button type="button" onClick={() => inputRef.current?.click()} className="min-h-11 rounded text-sm font-medium text-[#173B65] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]">Choisir un fichier</button><p className="text-xs text-slate-500">PDF, JPG ou PNG · 5 Mo maximum</p></>}</div>{file && <button type="button" onClick={() => { setFile(null); uploadId.current = "" }} aria-label="Retirer le fichier sélectionné" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" aria-hidden="true" /></button>}</div>
            <button type="submit" disabled={sending || !file || !name.trim()} className={button + " w-full bg-[#173B65] text-white hover:bg-[#123052] sm:w-auto"}><Upload className="h-4 w-4" aria-hidden="true" />{sending ? "Envoi en cours…" : "Envoyer le document"}</button>
          </fieldset>
          {uploadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{uploadError}</p>}{success && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><Check className="h-4 w-4" aria-hidden="true" />Votre document a bien été envoyé.</p>}
        </form>
        <section aria-label="Documents déposés" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-[#173B65]">Mes fichiers{documents.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">{documents.length}</span>}</h2><button type="button" disabled={loading || sending} aria-label="Actualiser mes fichiers" onClick={() => setRevision(v => v + 1)} className={button + " px-3"}><RefreshCw className="h-4 w-4" aria-hidden="true" /></button></div>
          {loading ? <p role="status" className="py-5 text-sm text-slate-500">Chargement des fichiers…</p> : data?.documentsError ? <p role="alert" className="text-sm text-red-800">{data.documentsError}</p> : !error && !documents.length ? <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">Vos fichiers apparaîtront ici après votre premier envoi.</p> : <ul className="divide-y divide-slate-100">{documents.map(doc => <li key={doc.key} className="flex items-center gap-3 py-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#173B65]"><FileText className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium text-slate-800">{doc.name}</p><p className={"mt-1 text-xs " + (doc.status === "Validated" ? "text-emerald-700" : doc.status === "Needs correction" ? "text-red-700" : "text-slate-500")}>{statusLabels[doc.status] || "Reçu"}</p></div>{doc.file && <a href={doc.file.url} target="_blank" rel="noopener noreferrer" aria-label={"Ouvrir " + doc.name + " dans un nouvel onglet"} className={button + " shrink-0 px-3"}><ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}</li>)}</ul>}
        </section>
      </Tabs.Content>
    </Tabs.Root>
  </main>
}
