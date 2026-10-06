"use client"
import { useEffect, useState } from "react"
import { FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudentPortal } from "@/components/student-portal-context"
type Document = { id: string; name: string; url: string }
export default function StudentOriginalDocuments() {
  const { studentInfo, reloadFromApi } = useStudentPortal()
  const [documents, setDocuments] = useState<Document[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState("")
  const [retry, setRetry] = useState(0)
  const [success, setSuccess] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError("")
    fetch("/api/admission-original-documents?" + new URLSearchParams({ email: studentInfo.email, folderId: studentInfo.folderId }), { signal: controller.signal })
      .then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.error); return data.documents })
      .then(setDocuments).catch(error => { if (!controller.signal.aborted) setError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [studentInfo.email, studentInfo.folderId, retry])
  async function upload() {
    setSending(true); setError(""); setSuccess(false)
    let completed = 0
    for (const file of files) {
      try {
        setProgress(`Envoi ${completed + 1}/${files.length} : ${file.name}`)
        const form = new FormData()
        form.set("email", studentInfo.email); form.set("folderId", studentInfo.folderId); form.set("file", file)
        const res = await fetch("/api/admission-original-documents", { method: "POST", body: form })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        completed++
        setFiles(previous => previous.filter(item => item !== file))
        setDocuments(data.documents)
      } catch (error) { setError(`${file.name} : ${error instanceof Error ? error.message : "Envoi impossible"}`); break }
    }
    setSending(false); setProgress(""); setSuccess(completed === files.length)
    if (completed) void reloadFromApi()
  }
  return <div className="space-y-4">
    <p className="text-sm leading-relaxed text-zinc-600">Ajoutez les scans lisibles de tous vos relevés de notes et de tous les diplômes obtenus, dans leur langue d’origine. Vous pouvez sélectionner plusieurs fichiers.</p>
    <section className="space-y-3 rounded-xl border border-zinc-200 p-4"><h3 className="text-sm font-semibold">Mes documents originaux</h3>{loading ? <p className="text-xs text-zinc-500">Chargement…</p> : documents.length ? documents.map(doc => <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"><FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{doc.name}</span></a>) : <p className="text-xs text-zinc-500">Vous n’avez pas encore ajouté de scans de vos documents originaux.</p>}</section>
    <section className="space-y-3 rounded-xl border border-zinc-200 p-4"><label htmlFor="original-documents" className="block text-sm font-semibold">Ajouter mes scans</label><input id="original-documents" type="file" multiple disabled={sending || loading} accept=".pdf,.jpg,.jpeg,.png" className="block min-h-11 w-full min-w-0 rounded-lg border border-zinc-200 p-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-100 file:p-2" onChange={event => {
      const selected = Array.from(event.target.files ?? []); event.target.value = ""
      const valid = selected.filter(file => file.size > 0 && file.size <= 5 * 1024 * 1024 && ["application/pdf", "image/jpeg", "image/png"].includes(file.type) && /\.(pdf|jpe?g|png)$/i.test(file.name))
      setError(valid.length !== selected.length ? "Certains fichiers sont invalides. PDF, JPG ou PNG de 5 Mo maximum par fichier." : "")
      setSuccess(false)
      setFiles(previous => [...previous, ...valid.filter(file => !previous.some(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified))])
    }} /><p className="text-xs text-zinc-500">PDF, JPG ou PNG · 5 Mo maximum par fichier</p>{files.map((file, index) => <div key={index} className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1 break-words">{file.name}</span><Button variant="ghost" size="icon" disabled={sending} onClick={() => setFiles(previous => previous.filter(item => item !== file))} aria-label={"Retirer " + file.name}><X className="h-4 w-4" /></Button></div>)}<Button className="min-h-11 w-full gap-2 sm:w-auto" disabled={!files.length || sending || loading} onClick={upload}><Upload className="h-4 w-4" />{sending ? "Envoi en cours…" : `Envoyer mes documents${files.length ? " (" + files.length + ")" : ""}`}</Button></section>
    {progress && <p role="status" className="break-words text-xs text-zinc-500">{progress}</p>}{error && <div role="alert" className="space-y-2"><p className="text-xs text-red-700">{error}</p><Button variant="outline" disabled={sending} onClick={() => setRetry(value => value + 1)}>Actualiser les documents</Button></div>}{success && <p role="status" className="text-sm text-emerald-700">Vos documents ont été enregistrés.</p>}
  </div>
}
