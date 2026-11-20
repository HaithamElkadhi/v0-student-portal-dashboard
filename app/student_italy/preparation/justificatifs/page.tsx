"use client"

import Link from "next/link"
import { useCallback, useEffect, useState, type FormEvent } from "react"
import { ArrowLeft, ExternalLink, Upload, X } from "lucide-react"
import { useStudentPortal } from "@/components/student-portal-context"
import { useStudentPreparation } from "@/components/use-student-preparation"

const types = ["IELTS", "CISIA (TOLC ou CEnT-S)", "TOEFL", "EF SET", "Autre justificatif ou équivalent"]
const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[#173B65]"
type PendingFile = { file: File; id: string }
type SentFile = { key: string; name: string; file: { filename: string; url: string } | null }

export default function PreparationProofsPage() {
  const { studentInfo: { email, folderId } } = useStudentPortal()
  const [type, setType] = useState("")
  const { preparation, error: preparationError, refresh: refreshPreparation } = useStudentPreparation()
  const [files, setFiles] = useState<PendingFile[]>([])
  const [sending, setSending] = useState(false)
  const [started, setStarted] = useState(false)
  const [sent, setSent] = useState(0)
  const [error, setError] = useState("")
  const [sentFiles, setSentFiles] = useState<SentFile[] | null>(null)
  const [historyError, setHistoryError] = useState("")
  const [historyRevision, setHistoryRevision] = useState(0)
  const endpoint = "/api/student-documents?" + new URLSearchParams({ folderId })
  const configuredType = preparation?.test.type
  const allowedTypes = configuredType === "EF Test" ? ["EF SET"]
    : configuredType === "CISIA ou équivalent" ? ["CISIA (TOLC ou CEnT-S)", "Autre justificatif ou équivalent"]
    : configuredType === "IELTS ou équivalent" ? ["IELTS", "TOEFL", "Autre justificatif ou équivalent"]
    : types
  const selectedType = allowedTypes.includes(type) ? type : allowedTypes.length === 1 ? allowedTypes[0] : ""

  const requestDocuments = useCallback(async (init?: RequestInit) => {
    let response = await fetch(endpoint, init)
    if (response.status !== 401) return response
    const verified = await fetch("/api/verify-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, folderId }),
      signal: init?.signal,
    })
    if (!verified.ok) throw new Error("Reconnectez-vous pour accéder à vos justificatifs.")
    response = await fetch(endpoint, init)
    return response
  }, [email, endpoint, folderId])

  useEffect(() => {
    const controller = new AbortController()
    setHistoryError("")
    async function loadHistory() {
      try {
        const response = await requestDocuments({ cache: "no-store", signal: controller.signal })
        if (!response.ok) throw new Error("Chargement impossible")
        const result = await response.json()
        if (!Array.isArray(result.documents)) throw new Error("Liste indisponible")
        if (!controller.signal.aborted) {
          setSentFiles((result.documents as SentFile[]).filter(({ key, name, file }) =>
            file && key.startsWith("portal:") && types.some(type => name.startsWith(type + " — ")),
          ))
        }
      } catch {
        if (!controller.signal.aborted) setHistoryError("Impossible de charger les justificatifs envoyés.")
      }
    }
    void loadHistory()
    return () => controller.abort()
  }, [requestDocuments, historyRevision])

  function addFiles(selection: FileList) {
    const selected = Array.from(selection)
    if (selected.some(file => !file.size || file.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name))) {
      setError("Choisissez des fichiers PDF, JPG ou PNG de 5 Mo maximum chacun.")
      return
    }
    setError("")
    if (!started) setSent(0)
    setFiles(previous => [...previous, ...selected.map(file => ({ file, id: crypto.randomUUID() }))])
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending || !preparation || configuredType === "Cacher" || !allowedTypes.includes(selectedType) || !files.length) return
    setSending(true)
    setStarted(true)
    setError("")

    try {
      for (const { file, id } of files) {
        const body = new FormData()
        body.set("name", selectedType + " — " + file.name.slice(0, 147 - selectedType.length))
        body.set("file", file)
        body.set("uploadId", id)
        const response = await requestDocuments({ method: "POST", body })
        if (!response.ok) {
          const result = await response.json().catch(() => null)
          const message = response.status === 413 ? "Le fichier dépasse la taille acceptée par le serveur." : result?.error || "Envoi impossible. Réessayez."
          setError(file.name + " — " + message)
          return
        }
        setFiles(previous => previous.filter(item => item.id !== id))
        setSent(count => count + 1)
      }
      setStarted(false)
      setType("")
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Envoi impossible. Réessayez.")
    } finally {
      setSending(false)
      setHistoryRevision(value => value + 1)
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4">
      <Link href="/student_italy/preparation" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#173B65] hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour à la préparation
      </Link>
      <section className="rounded-xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <h1 className="text-2xl font-semibold text-[#173B65]">{configuredType && configuredType !== "Cacher" ? configuredType : "Justificatifs de test"}</h1>
        {preparationError && <p role="alert" className="mt-3 text-sm text-red-800">{preparationError} <button onClick={refreshPreparation} className="min-h-11 underline">Réessayer</button></p>}
        {!preparation && !preparationError && <p role="status" className="mt-3 text-sm text-slate-600">Chargement du test demandé…</p>}
        {configuredType === "Cacher" && <p className="mt-3 text-sm text-slate-600">Aucun justificatif de test à déposer pour cette étape.</p>}
        {preparation && configuredType !== "Cacher" && <>
        <p className="mt-2 text-sm text-slate-600">Choisissez le type de justificatif et ajoutez les fichiers correspondants.</p>
        <form onSubmit={submit} className="mt-5">
          <fieldset disabled={sending} className="space-y-4">
            <label className="block space-y-1 text-sm font-medium">
              <span>Type de justificatif</span>
              <select required value={selectedType} disabled={started || allowedTypes.length === 1} onChange={event => setType(event.target.value)} className={field + " min-h-11"}>
                <option value="">Choisir un type</option>
                {allowedTypes.map(option => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-sm font-medium">
              <span>Fichiers</span>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" aria-describedby="proof-files-help" className={field + " min-h-11 file:mr-3 file:text-[#173B65]"}
                onChange={event => {
                  if (event.currentTarget.files?.length) addFiles(event.currentTarget.files)
                  event.currentTarget.value = ""
                }} />
              <span id="proof-files-help" className="block text-xs font-normal text-slate-600">PDF, JPG ou PNG · 5 Mo maximum par fichier</span>
            </label>
            {files.length > 0 && (
              <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 px-3">
                {files.map(({ id, file }) => (
                  <li key={id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 break-words">{file.name}</span>
                    <button type="button" aria-label={`Retirer ${file.name}`} className="grid size-11 shrink-0 place-items-center rounded-lg text-[#173B65] hover:bg-slate-100" onClick={() => {
                      setFiles(previous => previous.filter(item => item.id !== id))
                      if (files.length === 1) setStarted(false)
                    }}><X className="size-4" aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            )}
            <button type="submit" disabled={!selectedType || !files.length || sending} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#173B65] px-4 text-sm font-medium text-white hover:bg-[#123052] disabled:opacity-50">
              <Upload className="size-4" aria-hidden="true" /> {sending ? "Envoi en cours…" : "Envoyer les justificatifs"}
            </button>
          </fieldset>
          {sent > 0 && <p role="status" className="mt-3 text-sm text-emerald-800">{sent} {sent === 1 ? "fichier envoyé" : "fichiers envoyés"}.</p>}
          {error && <p role="alert" className="mt-3 break-words text-sm text-red-800">{error}</p>}
        </form>
        </>}
      </section>
      <section aria-labelledby="sent-proofs" className="rounded-xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <h2 id="sent-proofs" className="text-lg font-semibold text-[#173B65]">Justificatifs envoyés</h2>
        {historyError ? (
          <div className="mt-2 text-sm text-red-800">
            <p role="alert">{historyError}</p>
            <button type="button" onClick={() => setHistoryRevision(value => value + 1)} className="min-h-11 font-medium underline">Réessayer</button>
          </div>
        ) : sentFiles === null ? (
          <p role="status" className="mt-2 text-sm text-slate-600">Chargement des justificatifs…</p>
        ) : sentFiles.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Aucun justificatif envoyé pour le moment.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-200">
            {sentFiles.map(({ key, name, file }) => file && (
              <li key={key} className="py-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] underline underline-offset-4 focus-visible:outline-2">
                  <span className="min-w-0 break-words">{name.slice(0, name.indexOf(" — "))} — {file.filename}</span>
                  <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
