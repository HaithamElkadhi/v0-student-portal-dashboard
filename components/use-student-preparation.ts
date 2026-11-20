"use client"

import { useCallback, useEffect, useState } from "react"
import { useStudentPortal } from "@/components/student-portal-context"
import type { StudentPreparation } from "@/lib/student-preparation"

export function useStudentPreparation() {
  const { studentInfo: { email, folderId }, isRefreshing } = useStudentPortal()
  const [data, setData] = useState<{ folderId: string; preparation: StudentPreparation } | null>(null)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)
  const refresh = useCallback(() => setRevision(value => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setError("")
    async function load() {
      try {
        const endpoint = "/api/student-documents/preparation?" + new URLSearchParams({ folderId })
        let response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" })
        if (response.status === 401) {
          const verified = await fetch("/api/verify-student", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, folderId }), signal: controller.signal,
          })
          if (!verified.ok) throw new Error("Veuillez vous reconnecter pour consulter votre préparation.")
          response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" })
        }
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Préparation indisponible.")
        if (!controller.signal.aborted) setData({ folderId, preparation: result })
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Préparation indisponible.")
      }
    }
    void load()
    return () => controller.abort()
  }, [email, folderId, revision, isRefreshing])
  useEffect(() => {
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [refresh])

  return { preparation: data?.folderId === folderId ? data.preparation : null, error, refresh }
}
