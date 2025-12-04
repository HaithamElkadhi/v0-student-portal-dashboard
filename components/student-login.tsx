"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface StudentLoginProps {
  onSuccess: () => void
}

export default function StudentLogin({ onSuccess }: StudentLoginProps) {
  const [loginMethod, setLoginMethod] = useState<"email" | "folder">("email")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate login
    setTimeout(() => {
      setLoading(false)
      onSuccess()
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md p-8 border-2">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Student Login</h2>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginMethod("email")}
            className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
              loginMethod === "email"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("folder")}
            className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
              loginMethod === "folder"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Folder Number
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {loginMethod === "email" ? "Email Address" : "Folder Number"}
          </label>
          <Input
            type={loginMethod === "email" ? "email" : "text"}
            placeholder={loginMethod === "email" ? "your@email.com" : "JEE-2024-00001"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="border-input"
          />
        </div>

        <Button
          type="submit"
          disabled={!value || loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-6">Verification code will be sent to your email</p>
    </Card>
  )
}
