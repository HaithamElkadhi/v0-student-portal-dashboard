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
    <main className="flex min-h-dvh items-center justify-center bg-[var(--jx-night)] p-3 font-normal md:p-6">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-xl md:min-h-[620px] md:max-w-[1120px] md:flex-row">
        <ItalianSunsetPanel variant="banner" />
        <ItalianSunsetPanel variant="full" />

        <section className="flex w-full flex-col justify-center bg-white px-6 py-8 sm:px-10 md:w-[46%] md:min-w-[350px] md:shrink-0 md:py-10 lg:px-12">
          <PortalLoginForm onSuccess={handleSuccess} />
        </section>
      </div>
    </main>
  )
}
