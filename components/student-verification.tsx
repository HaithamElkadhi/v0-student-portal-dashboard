"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, FolderInput, Mail } from "lucide-react"

interface FileAttachment {
  id: string
  url: string
  filename: string
  size?: number
  type?: string
}

interface AdmissionData {
  proposalDocument?: string | string[] | FileAttachment[]
  contractDocument?: string | string[] | FileAttachment[]
  languageCertificate?: string | string[] | FileAttachment[]
  proposalStatus?: string | string[]
  upfrontPaiement?: string | string[]
  finalPaiement?: string | string[]
  admissionFolderDocuments?: string
  documentEvaluation?: string | string[]
  translation?: string | string[]
  declarationOfValue?: string | string[]
  emailForApplication?: string
  accountUniversitaly?: string | string[]
  accountPrenotami?: string | string[]
  applicationUniversity?: string | string[]
  proposal?: string | string[]
  paymentFirstRate?: string | string[]
  application?: string | string[]
  admissionPayment?: string | string[]
  paymentAcceptanceFees?: string | string[]
}

interface StudentVerificationProps {
  onSuccess: (info: {
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
    photo?: any
    admission?: AdmissionData
    accountStatus?: string
  }) => void
  /** When set, first step shows a back control (e.g. standalone /verification route). Omit on the main landing page. */
  onBack?: () => void
  /** Hides repeated logo and standalone back; tuned for the home landing layout. */
  embedded?: boolean
}

export default function StudentVerification({ onSuccess, onBack, embedded = false }: StudentVerificationProps) {
  const [step, setStep] = useState<"method" | "details">("method")
  const [loginMethod, setLoginMethod] = useState<"email" | "folder" | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    folderId: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMethodSelect = (method: "email" | "folder") => {
    setLoginMethod(method)
    setStep("details")
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/verify-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginMethod === "email" ? formData.email : undefined,
          folderId: loginMethod === "folder" ? formData.folderId : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Verification failed. Please try again.")
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
          photo: student.photo,
          admission: student.admission,
          accountStatus: student.accountStatus,
        })
      } else {
        setError("Student not found. Please check your credentials.")
        setLoading(false)
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError("An error occurred during verification. Please try again.")
      setLoading(false)
    }
  }

  const showStandaloneBack = step === "method" && onBack && !embedded

  return (
    <div className="w-full max-w-md">
      {showStandaloneBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Home
        </button>
      ) : null}

      {step === "method" ? (
        <Card className="border border-border/80 p-6 shadow-sm sm:p-7">
          {!embedded ? (
            <div className="mb-6 flex justify-center">
              <img src="/Jeexpert Logo base.png" alt="" className="h-11 w-auto" />
            </div>
          ) : null}
          <div className="mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Sign in</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Use the same email or folder ID we use in your file.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleMethodSelect("email")}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Mail className="size-[18px]" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">Email</span>
                <span className="block text-xs text-muted-foreground">Address on your application</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMethodSelect("folder")}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-secondary-foreground">
                <FolderInput className="size-[18px]" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">Folder ID</span>
                <span className="block text-xs text-muted-foreground">e.g. JEE-2024-00001</span>
              </span>
            </button>
          </div>
        </Card>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setStep("method")
              setLoginMethod(null)
              setError(null)
            }}
            className="mb-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Other sign-in option
          </button>

          <Card className="border border-border/80 p-6 shadow-sm sm:p-7">
            {!embedded ? (
              <div className="mb-6 flex justify-center">
                <img src="/Jeexpert Logo base.png" alt="" className="h-11 w-auto" />
              </div>
            ) : null}
            <div className="mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {loginMethod === "email" ? "Your email" : "Your folder ID"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">We match this against our records.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMethod === "email" ? (
                <div className="space-y-2">
                  <label htmlFor="sv-email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="sv-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="sv-folder" className="text-sm font-medium text-foreground">
                    Folder ID
                  </label>
                  <Input
                    id="sv-folder"
                    type="text"
                    name="folderId"
                    autoComplete="off"
                    placeholder="JEE-2024-00001"
                    value={formData.folderId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {error ? (
                <div className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={loading || (loginMethod === "email" ? !formData.email : !formData.folderId)}
                className="w-full"
              >
                {loading ? "Checking…" : "Continue"}
              </Button>
            </form>
          </Card>
        </>
      )}
    </div>
  )
}
