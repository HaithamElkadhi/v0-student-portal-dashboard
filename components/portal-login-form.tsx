"use client"

import type React from "react"
import { useState } from "react"
import { ArrowRight } from "lucide-react"

export interface PortalStudentInfo {
  name: string
  email: string
  folderId: string
  surname?: string
  gender?: string
  phone?: string
  whatsapp?: string
  birthday?: string
  citizenship?: string
  countryOfResidence?: string
  fullAddress?: string
  passportValidity?: string
  numberApplications?: string | number
  photo?: unknown
  admission?: Record<string, unknown>
  accountStatus?: string
}

interface PortalLoginFormProps {
  onSuccess: (info: PortalStudentInfo) => void
}

export function PortalLoginForm({ onSuccess }: PortalLoginFormProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError("Saisissez votre adresse e-mail.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          loginEvent: true,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Nous n'avons pas pu vérifier ces informations. Réessayez.")
        setLoading(false)
        return
      }

      if (data.success && data.student) {
        const student = data.student
        onSuccess({
          name: student.name || "Student",
          email: student.email,
          folderId: student.folderId,
          surname: student.surname,
          gender: student.gender,
          phone: student.phone,
          whatsapp: student.whatsapp,
          birthday: student.birthday,
          citizenship: student.citizenship,
          countryOfResidence: student.countryOfResidence,
          fullAddress: student.fullAddress,
          passportValidity: student.passportValidity,
          numberApplications: student.numberApplications,
          photo: student.photo,
          admission: student.admission,
          accountStatus: student.accountStatus,
        })
      } else {
        setError("Aucun dossier ne correspond à ces informations.")
        setLoading(false)
      }
    } catch {
      setError("Une erreur s'est produite. Vérifiez votre connexion et réessayez.")
      setLoading(false)
    }
  }

  const controlFocus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65] focus-visible:ring-offset-2"

  return (
    <div className="mx-auto w-full max-w-sm">
      <header className="mb-8">
        <img
          src="/brand/jeexpert-logo.png"
          alt="JEEXPERT"
          width={1280}
          height={1280}
          className="mb-3 size-32 object-contain"
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-[#173B65]">Portail étudiant</p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-[#172D43]">
          Connectez-vous à votre espace
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Retrouvez votre dossier et suivez vos démarches pour étudier en Italie.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
        <div>
          <label htmlFor="portal-email" className="mb-2 block text-sm font-medium text-[#172D43]">
            Adresse e-mail
          </label>
          <input
            id="portal-email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value.trim())
              setError(null)
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "portal-login-error" : "portal-email-help"}
            disabled={loading}
            className="min-h-12 w-full rounded-lg border border-[#D9E2EC] bg-white px-3 text-base text-[#172D43] outline-none placeholder:text-slate-500 focus:border-[#173B65] focus:ring-2 focus:ring-[#80C4EA] disabled:bg-slate-50 sm:text-sm"
          />
          {error ? (
            <p id="portal-login-error" role="alert" className="mt-2 text-sm text-[#B83232]">{error}</p>
          ) : (
            <p id="portal-email-help" className="mt-2 text-xs text-slate-600">Utilisez l’adresse e-mail liée à votre dossier.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={"flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#173B65] px-4 text-sm font-medium text-white transition-colors hover:bg-[#122e4f] disabled:cursor-not-allowed disabled:opacity-70 " + controlFocus}
        >
          {loading ? <span className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
          {loading ? "Connexion en cours…" : "Accéder à mon portail"}
        </button>
      </form>

      <p className="mt-6 border-t border-[#D9E2EC] pt-4 text-sm text-slate-600">
        Besoin d&apos;aide ?{" "}
        <a href="https://wa.me/393520880880" target="_blank" rel="noopener noreferrer" className={"inline-flex min-h-11 items-center rounded-lg font-medium text-[#173B65] underline underline-offset-4 " + controlFocus}>
          Contacter votre conseiller
        </a>
      </p>
    </div>
  )
}
