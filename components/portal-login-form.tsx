"use client"

import type React from "react"
import { useState } from "react"

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

function IconEnvelope({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--jx-terracotta)" strokeWidth="2" />
      <path d="M3 7l9 5.5L21 7" stroke="var(--jx-terracotta)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7a2 2 0 012-2h4l2 3h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="var(--jx-terracotta)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="var(--jx-terracotta)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconArrowRightWhite({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h12m-4-4 4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheckWhite({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12l4 4L19 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface PortalLoginFormProps {
  onSuccess: (info: PortalStudentInfo) => void
}

export function PortalLoginForm({ onSuccess }: PortalLoginFormProps) {
  const [step, setStep] = useState<"choose" | "details">("choose")
  const [method, setMethod] = useState<"email" | "folder" | null>(null)
  const [email, setEmail] = useState("")
  const [folderId, setFolderId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goToChoose = () => {
    setStep("choose")
    setMethod(null)
    setError(null)
  }

  const selectMethod = (m: "email" | "folder") => {
    setMethod(m)
    setStep("details")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!method) return

    const eTrim = email.trim()
    const fTrim = folderId.trim()
    if (method === "email" && !eTrim) {
      setError("Enter your email address.")
      return
    }
    if (method === "folder" && !fTrim) {
      setError("Enter your folder ID.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: method === "email" ? eTrim : undefined,
          folderId: method === "folder" ? fTrim : undefined,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "We could not verify those details. Try again.")
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
        setError("No file matches those details.")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.")
      setLoading(false)
    }
  }

  const inputClass =
    "h-[42px] w-full rounded-[10px] border-[1.5px] border-[var(--jx-sand)] bg-[var(--jx-cream)] px-3.5 text-sm font-normal text-[var(--jx-night)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[13px] placeholder:text-[var(--jx-hint)] focus:border-[var(--jx-terracotta)] focus:shadow-[0_0_0_3px_rgba(196,97,47,0.10)] disabled:opacity-50"

  const cardChoose =
    "flex cursor-pointer flex-col gap-3 rounded-xl border-[1.5px] border-[var(--jx-sand)] bg-[var(--jx-cream)] p-3.5 text-left transition-[border-color,background-color,transform] duration-200 ease-out hover:-translate-y-px hover:border-[var(--jx-terracotta)] hover:bg-[#fef9f5] active:scale-[0.99]"

  return (
    <div className="w-full">
      <div key={step} className="flex flex-col gap-[22px]">
        <header className="jx-seq-1 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--jx-terracotta)]">
            Student portal
          </p>
          <h2 className="text-[26px] font-medium leading-[1.25] tracking-tight text-[var(--jx-night)]">
            Benvenuto. Let&apos;s track your <em className="font-normal not-italic text-[var(--jx-terracotta)]">journey.</em>
          </h2>
          <p className="mt-1.5 text-[13px] font-normal leading-[1.6] text-[var(--jx-muted)]">
            Verify your identity to access your admission, visa & scholarship dashboard.
          </p>
        </header>

        {step === "choose" ? (
          <>
            <div className="jx-seq-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => selectMethod("email")} className={cardChoose}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fde8d8]">
                  <IconEnvelope />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--jx-night)]">Email</p>
                  <p className="mt-0.5 text-[11px] font-normal text-[var(--jx-muted)]">Registered address</p>
                </div>
              </button>

              <button type="button" onClick={() => selectMethod("folder")} className={cardChoose}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fde8d8]">
                  <IconFolder />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--jx-night)]">Folder ID</p>
                  <p className="mt-0.5 text-[11px] font-normal text-[var(--jx-muted)]">Unique number</p>
                </div>
              </button>
            </div>

            <p className="jx-seq-6 text-center text-xs text-[var(--jx-hint)]">
              Need help?{" "}
              <a
                href="https://wa.me/393520880880"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--jx-terracotta)] no-underline transition-all hover:underline"
              >
                Contact your advisor
              </a>
            </p>
          </>
        ) : (
          <>
            <div className="jx-seq-2">
              <button
                type="button"
                onClick={goToChoose}
                className="mb-1 flex items-center gap-2 text-xs font-medium text-[var(--jx-terracotta)] transition-opacity hover:opacity-80"
              >
                <IconArrowLeft className="shrink-0" />
                Change sign-in option
              </button>

              <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
                <div className="rounded-xl border-[1.5px] border-[var(--jx-terracotta)] bg-[#fef3ec] p-3.5">
                  {method === "email" ? (
                    <>
                      <div className="flex gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fde8d8]">
                          <IconEnvelope />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[var(--jx-night)]">Email</p>
                          <p className="mt-0.5 text-[11px] font-normal text-[var(--jx-muted)]">Registered address</p>
                          <div className="jx-check-pop mt-2 flex justify-start">
                            <span
                              className="flex size-4 items-center justify-center rounded-full bg-[var(--jx-terracotta)]"
                              aria-hidden
                            >
                              <IconCheckWhite />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label
                          htmlFor="portal-email"
                          className="mb-1.5 block text-xs font-medium text-[#5f5e5a]"
                        >
                          Email address
                        </label>
                        <input
                          id="portal-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(ev) => {
                            setEmail(ev.target.value)
                            setError(null)
                          }}
                          className={inputClass}
                          autoFocus
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fde8d8]">
                          <IconFolder />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[var(--jx-night)]">Folder ID</p>
                          <p className="mt-0.5 text-[11px] font-normal text-[var(--jx-muted)]">Unique number</p>
                          <div className="jx-check-pop mt-2 flex justify-start">
                            <span
                              className="flex size-4 items-center justify-center rounded-full bg-[var(--jx-terracotta)]"
                              aria-hidden
                            >
                              <IconCheckWhite />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label htmlFor="portal-folder" className="mb-1.5 block text-xs font-medium text-[#5f5e5a]">
                          Folder ID
                        </label>
                        <input
                          id="portal-folder"
                          name="folderId"
                          type="text"
                          autoComplete="off"
                          placeholder="e.g. ITAHF31"
                          value={folderId}
                          onChange={(ev) => {
                            setFolderId(ev.target.value)
                            setError(null)
                          }}
                          className={inputClass}
                          autoFocus
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="jx-seq-3 flex flex-col gap-5">
                  {error ? (
                    <p className="text-xs font-normal text-[#E24B4A]" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="jx-seq-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--jx-night)] text-sm font-medium text-white transition-[background,transform] duration-200 ease-out hover:bg-[var(--jx-terracotta)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-90"
                  >
                    {loading ? (
                      <span
                        className="size-4 shrink-0 rounded-full border-2 border-white/35 border-t-white motion-safe:animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <>
                        <IconArrowRightWhite />
                        Access my portal
                      </>
                    )}
                  </button>
                </div>

                <div className="jx-seq-5 flex flex-wrap gap-x-[14px] gap-y-2">
                  {["Secure access", "Real-time updates", "JEEXPERT certified"].map((label) => (
                    <span
                      key={label}
                      className="flex items-center gap-2 text-[11px] font-normal text-[var(--jx-muted)]"
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-[var(--jx-terracotta)] opacity-50"
                        aria-hidden
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </form>
            </div>

            <p className="jx-seq-6 text-center text-xs text-[var(--jx-hint)]">
              Need help?{" "}
              <a
                href="https://wa.me/393520880880"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--jx-terracotta)] no-underline transition-all hover:underline"
              >
                Contact your advisor
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
