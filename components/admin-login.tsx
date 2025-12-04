"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface AdminLoginProps {
  onBack: () => void
}

export default function AdminLogin({ onBack }: AdminLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate login
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-2">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
            ← Back
          </Button>
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin Portal</h2>
          <p className="text-sm text-muted-foreground">Sign in to manage student applications</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <Input
              type="email"
              placeholder="admin@jeexpert.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-input"
            />
          </div>

          <Button
            type="submit"
            disabled={!email || !password || loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Demo credentials:</strong>
            <br />
            Email: admin@jeexpert.com
            <br />
            Password: password123
          </p>
        </div>
      </Card>
    </div>
  )
}
