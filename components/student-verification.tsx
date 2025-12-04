"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"

interface AdmissionData {
  proposal?: string | string[]
  paymentFirstRate?: string | string[]
  emailForApplication?: string
  declarationOfValue?: string | string[]
  translation?: string | string[]
  admissionFolderDocuments?: string
  application?: string | string[]
  admissionPayment?: string | string[]
  applicationUniversity?: string | string[]
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
  }) => void
  onBack: () => void
}

export default function StudentVerification({ onSuccess, onBack }: StudentVerificationProps) {
  const [step, setStep] = useState<"method" | "details">("method")
  const [loginMethod, setLoginMethod] = useState<"email" | "folder" | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    folderId: "",
    name: "",
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
        // Use the student data from Airtable
        const student = data.student
        const fullName = student.name
          ? `${student.name}${student.surname ? ` ${student.surname}` : ""}`
          : student.surname || "Student"
        
        onSuccess({
          name: fullName,
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

  return (
    <div className="w-full max-w-md">
      {step === "method" ? (
        <>
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Card className="p-8 border-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Student Verification</h2>
              <p className="text-sm text-muted-foreground">Choose how you'd like to verify your identity</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleMethodSelect("email")}
                className="w-full p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-muted transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    ✉
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Verify with Email</p>
                    <p className="text-xs text-muted-foreground">Use your registered email address</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect("folder")}
                className="w-full p-4 rounded-lg border-2 border-border hover:border-secondary hover:bg-muted transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    📁
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Verify with Folder ID</p>
                    <p className="text-xs text-muted-foreground">Use your unique folder number</p>
                  </div>
                </div>
              </button>
            </div>
          </Card>
        </>
      ) : (
        <>
          <button
            onClick={() => setStep("method")}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Card className="p-8 border-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {loginMethod === "email" ? "Email Verification" : "Folder ID Verification"}
              </h2>
              <p className="text-sm text-muted-foreground">Enter your details to access your profile</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMethod === "email" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border-input"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Folder ID</label>
                  <Input
                    type="text"
                    name="folderId"
                    placeholder="JEE-2024-00001"
                    value={formData.folderId}
                    onChange={handleInputChange}
                    required
                    className="border-input"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || (loginMethod === "email" ? !formData.email : !formData.folderId)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your credentials will be verified against our records
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
