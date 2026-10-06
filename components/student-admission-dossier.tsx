"use client"
import { useEffect, useState } from "react"
import AdmissionForm from "@/components/admission-dossier/AdmissionForm"
import type { AdmissionFormData, ExistingSubmission } from "@/components/admission-dossier/types"
import { useStudentPortal } from "@/components/student-portal-context"
import { Button } from "@/components/ui/button"
export default function StudentAdmissionDossier() {
  const { studentInfo } = useStudentPortal()
  const [result, setResult] = useState<{ data: AdmissionFormData; existing: ExistingSubmission | null } | null>(null)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setResult(null); setError("")
    fetch("/api/student-admission-dossier?" + new URLSearchParams({ email: studentInfo.email, folderId: studentInfo.folderId }), { signal: controller.signal })
      .then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.error); return data })
      .then(setResult).catch(error => { if (!controller.signal.aborted) setError(error.message) })
    return () => controller.abort()
  }, [studentInfo.email, studentInfo.folderId, retry])
  if (error) return <div role="alert" className="space-y-3"><p className="text-sm text-red-700">{error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Réessayer</Button></div>
  if (!result) return <p className="py-6 text-sm text-zinc-500">Chargement de votre dossier prérempli…</p>
  return <div className="space-y-4"><p className="text-sm text-zinc-600">Déposez ici votre dossier d’admission avec les documents traduits selon les exigences de votre université. Les informations disponibles sont préremplies.</p><AdmissionForm initialData={result.data} existing={result.existing} /></div>
}
