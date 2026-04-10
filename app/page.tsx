"use client"

import { useRouter } from "next/navigation"
import { ItalianSunsetPanel } from "@/components/italian-sunset-panel"
import { PortalLoginForm, type PortalStudentInfo } from "@/components/portal-login-form"

export default function Page() {
  const router = useRouter()

  const handleSuccess = (info: PortalStudentInfo) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("studentInfo", JSON.stringify(info))
    }
    router.push("/student_italy")
  }

  return (
    <main className="flex min-h-dvh justify-center bg-[var(--jx-night)] p-3 font-normal md:min-h-screen md:items-center md:p-5">
      <div className="flex min-h-[calc(100dvh-24px)] w-full max-w-[1280px] flex-col overflow-hidden rounded-[20px] md:h-[min(100dvh,900px)] md:max-h-[calc(100vh-40px)] md:min-h-0 md:flex-row">
        <ItalianSunsetPanel variant="banner" />
        <ItalianSunsetPanel variant="full" />

        <section className="flex min-h-0 w-full flex-1 flex-col justify-center bg-white md:w-[420px] md:flex-none md:shrink-0">
          <div className="jx-login-surface flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-contain px-9 py-10 md:py-10">
            <PortalLoginForm onSuccess={handleSuccess} />
          </div>
        </section>
      </div>
    </main>
  )
}
