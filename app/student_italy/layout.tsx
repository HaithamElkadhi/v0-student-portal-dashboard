"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  StudentPortalProvider,
  type PortalStudentInfo,
} from "@/components/student-portal-context"
import { StudentPortalShell } from "@/components/student-portal-shell"

export default function StudentItalyLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [studentInfo, setStudentInfoState] = useState<PortalStudentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("studentInfo")
    if (raw) {
      try {
        setStudentInfoState(JSON.parse(raw) as PortalStudentInfo)
      } catch {
        router.push("/")
      }
    } else {
      router.push("/")
    }
    setLoading(false)
  }, [router])

  const setStudentInfo = useCallback((u: PortalStudentInfo) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("studentInfo", JSON.stringify(u))
    }
    setStudentInfoState(u)
  }, [])

  const onLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("studentInfo")
    }
    router.push("/")
  }, [router])

  const reloadFromApi = useCallback(async () => {
    if (!studentInfo) return
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: studentInfo.email,
          folderId: studentInfo.folderId,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success && data.student) {
        const s = data.student
        setStudentInfo({
          name: s.name || "Student",
          email: s.email,
          folderId: s.folderId,
          surname: s.surname,
          gender: s.gender,
          phone: s.phone,
          whatsapp: s.whatsapp,
          birthday: s.birthday,
          citizenship: s.citizenship,
          countryOfResidence: s.countryOfResidence,
          fullAddress: s.fullAddress,
          passportValidity: s.passportValidity,
          photo: s.photo,
          admission: s.admission,
          accountStatus: s.accountStatus,
        })
      }
    } catch (e) {
      console.error("Refresh error:", e)
    } finally {
      setIsRefreshing(false)
    }
  }, [studentInfo, setStudentInfo])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--jx-night)] font-sans">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-[var(--jx-terracotta)]"
            aria-hidden
          />
          <p className="text-sm text-white/70">Loading your portal…</p>
        </div>
      </div>
    )
  }

  if (!studentInfo) {
    return null
  }

  return (
    <StudentPortalProvider
      value={{
        studentInfo,
        setStudentInfo,
        onLogout,
        reloadFromApi,
        isRefreshing,
      }}
    >
      <StudentPortalShell>{children}</StudentPortalShell>
    </StudentPortalProvider>
  )
}
