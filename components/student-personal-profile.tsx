"use client"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useStudentPortal } from "@/components/student-portal-context"
function coerceSingleLine(value: unknown): string {
  if (value == null) return ""
  if (Array.isArray(value)) return coerceSingleLine(value[0])
  return String(value).trim()
}
export default function StudentPersonalProfile() {
  const { studentInfo } = useStudentPortal()
  const displayName = coerceSingleLine(studentInfo.name)
  const passportValidity = coerceSingleLine(studentInfo.passportValidity) || "—"
  const scrollMainTop = "scroll-mt-20 md:scroll-mt-14"
  const denseLabel = "text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
  const denseValue = "break-words text-sm font-medium text-zinc-900"
  return (
        <Card
          id="profil"
          className={cn(
            "rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5",
            scrollMainTop,
          )}
        >
          <h1 className="mb-5 text-lg font-semibold text-zinc-900">Mon profil</h1>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Prénom</p>
              <p className={cn(denseValue)}>{displayName || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Nom</p>
              <p className={cn(denseValue)}>{coerceSingleLine(studentInfo.surname) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Genre</p>
              <p className={denseValue}>{coerceSingleLine(studentInfo.gender) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Date de naissance</p>
              <p className={denseValue}>
                {studentInfo.birthday ? new Date(String(studentInfo.birthday)).toLocaleDateString("fr-FR") : "—"}
              </p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Téléphone</p>
              <p className={cn(denseValue)}>{coerceSingleLine(studentInfo.phone) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>WhatsApp</p>
              <p className={cn(denseValue)}>{coerceSingleLine(studentInfo.whatsapp) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Nationalité</p>
              <p className={cn(denseValue)}>{coerceSingleLine(studentInfo.citizenship) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Résidence</p>
              <p className={cn(denseValue)}>{coerceSingleLine(studentInfo.countryOfResidence) || "—"}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Validité passeport (mois)</p>
              <p className={cn(denseValue)}>{passportValidity}</p>
            </div>
            <div className="min-w-0 border-b border-zinc-100 pb-2.5">
              <p className={denseLabel}>Adresse</p>
              <p className={cn(denseValue)}>{coerceSingleLine(studentInfo.fullAddress) || "—"}</p>
            </div>
          </div>
        </Card>
  )
}
