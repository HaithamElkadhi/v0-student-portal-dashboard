"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, ExternalLink, Eye, EyeOff } from "lucide-react"
import { useStudentPortal } from "@/components/student-portal-context"

type Account = { id: string; username: string; labels: string[]; password: string; url: string }
type Accounts = { applicationEmail: string; accounts: Account[] }

export default function StudentCredentialsPage() {
  const { studentInfo: { email, folderId }, isRefreshing } = useStudentPortal()
  const [data, setData] = useState<Accounts | null>(null)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)
  const [visible, setVisible] = useState<string[]>([])
  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError("")
    setVisible([])
    async function load() {
      try {
        const endpoint = "/api/student-documents/accounts?" + new URLSearchParams({ folderId })
        let response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" })
        if (response.status === 401) {
          const verified = await fetch("/api/verify-student", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, folderId }), signal: controller.signal,
          })
          if (!verified.ok) throw new Error("Veuillez vous reconnecter pour consulter vos identifiants.")
          response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" })
        }
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Impossible de charger vos identifiants.")
        if (!controller.signal.aborted) setData(result)
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Chargement impossible.")
      }
    }
    void load()
    return () => controller.abort()
  }, [email, folderId, revision, isRefreshing])

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5">
      <Link href="/student_italy/preparation" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-2">
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour à la préparation
      </Link>
      <section className="rounded-xl border border-[#D9E2EC] bg-white p-5 sm:p-7">
        <h1 className="text-2xl font-semibold text-[#173B65]">Mes identifiants</h1>
        <p className="mt-2 text-sm text-slate-600">Les comptes et accès créés pour vous par JEEXPERT.</p>
        {error ? (
          <div className="mt-5 text-sm text-red-800">
            <p role="alert">{error}</p>
            <button type="button" onClick={() => setRevision(value => value + 1)} className="min-h-11 rounded font-medium underline focus-visible:outline-2">Réessayer</button>
          </div>
        ) : !data ? (
          <p role="status" className="mt-5 text-sm text-slate-600">Chargement de vos identifiants…</p>
        ) : (
          <div className="mt-5 space-y-4">
            {data.applicationEmail && (
              <div className="rounded-lg bg-[#E8F4FB] p-4">
                <h2 className="text-sm font-medium text-[#173B65]">Adresse e-mail de candidature</h2>
                <p className="mt-1 break-all text-sm">{data.applicationEmail}</p>
              </div>
            )}
            {data.accounts.length === 0 ? <p className="text-sm text-slate-600">Aucun identifiant enregistré pour votre dossier pour le moment.</p> : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {data.accounts.map(account => (
                  <li key={account.id} className="min-w-0 rounded-lg border border-[#D9E2EC] p-4">
                    <h2 className="font-semibold text-[#173B65]">{account.labels.join(" · ") || "Compte étudiant"}</h2>
                    <dl className="mt-3 space-y-3 text-sm">
                      {account.url && (
                        <div>
                          <dt className="text-slate-600">Lien de connexion</dt>
                          <dd>
                            <a href={account.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 max-w-full items-center gap-2 rounded text-[#173B65] underline underline-offset-4 focus-visible:outline-2">
                              <span className="min-w-0 break-all">{account.url}</span>
                              <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                            </a>
                          </dd>
                        </div>
                      )}
                      <div><dt className="text-slate-600">Identifiant</dt><dd className="mt-1 break-all">{account.username || "Pas encore renseigné"}</dd></div>
                      <div>
                        <dt className="text-slate-600">Mot de passe</dt>
                        <dd className="mt-1">
                          {!account.password ? "Pas encore renseigné" : (
                            <>
                              <p className="break-all">{visible.includes(account.id) ? account.password : "••••••••"}</p>
                              <button type="button" aria-pressed={visible.includes(account.id)} aria-label={`${visible.includes(account.id) ? "Masquer" : "Afficher"} le mot de passe ${account.labels.join(" · ") || account.username}`}
                                onClick={() => setVisible(previous => previous.includes(account.id) ? previous.filter(id => id !== account.id) : [...previous, account.id])}
                                className="mt-1 inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-[#173B65] hover:underline focus-visible:outline-2">
                                {visible.includes(account.id) ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                                {visible.includes(account.id) ? "Masquer" : "Afficher"}
                              </button>
                            </>
                          )}
                        </dd>
                      </div>
                    </dl>
                    {account.url && <a href={account.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#173B65] px-3 text-sm font-medium text-white hover:bg-[#123052] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B65]">
                      Ouvrir le service <ExternalLink className="size-4" aria-hidden="true" />
                    </a>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
