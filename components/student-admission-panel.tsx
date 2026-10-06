"use client"

import { Card } from "@/components/ui/card"
import { AdmissionDetailsContent, type AdmissionData } from "@/components/admission-details"
import { useStudentPortal } from "@/components/student-portal-context"

export default function StudentAdmissionPanel() {
  const { studentInfo } = useStudentPortal()

  return (
    <>
      <h1 className="sr-only">Admission</h1>

      <Card className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <AdmissionDetailsContent
          admissionData={studentInfo.admission as AdmissionData | undefined}
          prospectId={studentInfo.folderId}
          contratSigned={studentInfo.contratSigned}
          studentEmail={studentInfo.email}
        />
      </Card>
    </>
  )
}
