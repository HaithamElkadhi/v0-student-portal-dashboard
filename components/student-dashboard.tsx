"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import StatusCard from "@/components/status-card"
import AdmissionDetails from "@/components/admission-details"
import ViewApplications from "@/components/view-applications"
import Link from "next/link"
import { LogOut, Mail, FolderOpen, User, Phone, MessageCircle, Calendar, Globe, MapPin, FileText, Shield, Flag, RefreshCw, CreditCard } from "lucide-react"
import { PaymentHomeSummary } from "@/components/payments/payment-home-summary"

interface FileAttachment {
  id: string
  url: string
  filename: string
  size?: number
  type?: string
}

interface AdmissionData {
  // Bloc 1 - Proposal
  proposalDocument?: string | string[] | FileAttachment[]
  proposalStatus?: string | string[]
  // Bloc 2 - Paiement
  upfrontPaiement?: string | string[]
  finalPaiement?: string | string[]
  // Bloc 3 - Documents
  admissionFolderDocuments?: string
  documentEvaluation?: string | string[]
  translation?: string | string[]
  declarationOfValue?: string | string[]
  // Bloc 4 - Requirement
  emailForApplication?: string
  accountUniversitaly?: string | string[]
  accountPrenotami?: string | string[]
  // Bloc 5 - Application
  applicationUniversity?: string | string[]
  // Legacy fields (for backward compatibility)
  proposal?: string | string[]
  paymentFirstRate?: string | string[]
  application?: string | string[]
  admissionPayment?: string | string[]
  paymentAcceptanceFees?: string | string[]
}

interface StudentInfo {
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
  accountStatus?: string
}

interface StudentDashboardProps {
  onLogout: () => void
  studentInfo: StudentInfo
  onRefresh: (updatedInfo: StudentInfo) => void
}

export default function StudentDashboard({ onLogout, studentInfo, onRefresh }: StudentDashboardProps) {
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false)
  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate admission percentage based on completion status
  const calculateAdmissionPercentage = (admissionData?: AdmissionData): number => {
    if (!admissionData) return 0

    const steps = [
      { value: admissionData.proposal, isCompleted: (v: any) => 
        String(v || "").toLowerCase().includes("accepted") || 
        String(v || "").toLowerCase().includes("signed") },
      { value: admissionData.paymentFirstRate, isCompleted: (v: any) => 
        String(v || "").toLowerCase().includes("paid") || 
        String(v || "").toLowerCase().includes("exonerated") },
      { value: admissionData.emailForApplication, isCompleted: (v: any) => 
        v && String(v).trim() !== "" },
      { value: admissionData.declarationOfValue, isCompleted: (v: any) => 
        String(v || "").toLowerCase().includes("done") },
      { value: admissionData.translation, isCompleted: (v: any) => 
        String(v || "").toLowerCase().includes("done") },
      { value: admissionData.admissionFolderDocuments, isCompleted: (v: any) => 
        v && String(v).trim() !== "" },
      { value: admissionData.application, isCompleted: (v: any) => 
        String(v || "").toLowerCase().includes("accepted") },
      { value: admissionData.admissionPayment, isCompleted: (v: any) => 
        String(v || "").toLowerCase().includes("paid") },
    ]

    let completedCount = 0
    let startedCount = 0

    steps.forEach((step) => {
      const hasValue = Array.isArray(step.value) 
        ? step.value.length > 0 
        : step.value && String(step.value).trim() !== ""
      
      if (hasValue) {
        startedCount++
        // Check if completed
        const values = Array.isArray(step.value) ? step.value : [step.value]
        if (values.some(v => step.isCompleted(v))) {
          completedCount++
        }
      }
    })

    // If nothing started, return 0
    if (startedCount === 0) return 0

    // Calculate: weight completed steps more (70% weight) + started but not completed (30% weight)
    const totalSteps = steps.length
    const completedWeight = (completedCount / totalSteps) * 70
    const startedWeight = ((startedCount - completedCount) / totalSteps) * 30
    
    return Math.round(completedWeight + startedWeight)
  }

  // Get admission status text
  const getAdmissionStatus = (admissionData?: AdmissionData): string => {
    if (!admissionData) return "Not Started"
    
    const percentage = calculateAdmissionPercentage(admissionData)
    
    if (percentage === 0) return "Not Started"
    if (percentage === 100) return "Completed"
    if (percentage >= 70) return "Almost Complete"
    if (percentage >= 40) return "In Progress"
    return "Started"
  }

  const admissionPercentage = calculateAdmissionPercentage(studentInfo.admission)
  const admissionStatus = getAdmissionStatus(studentInfo.admission)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/verify-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: studentInfo.email,
          folderId: studentInfo.folderId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.student) {
        const student = data.student
        onRefresh({
          name: student.name || "Student",
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
          accountStatus: student.accountStatus,
        })
      }
    } catch (error) {
      console.error("Refresh error:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/Jeexpert Logo base.png" 
                alt="JEEXPERT Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-primary">JEEXPERT</h1>
                <p className="text-sm text-muted-foreground">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID:</span>
              <span className="text-sm font-bold text-primary font-mono">{studentInfo.folderId || "—"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Information Section */}
        <Card className="border-2 p-8 mb-8 bg-card shadow-lg">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground">Information</h3>
          </div>

          {/* Photo and Basic Identity */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-border">
            {/* Photo - Bigger */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-lg">
                {studentInfo.photo && Array.isArray(studentInfo.photo) && studentInfo.photo.length > 0 ? (
                  <img
                    src={studentInfo.photo[0].url || studentInfo.photo[0].thumbnails?.large?.url}
                    alt={`${studentInfo.name} photo`}
                    className="w-full h-full object-cover"
                  />
                ) : studentInfo.photo && typeof studentInfo.photo === "string" ? (
                  <img
                    src={studentInfo.photo}
                    alt={`${studentInfo.name} photo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-4xl">
                    {studentInfo.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Identity Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Name
                </label>
                <p className="text-lg font-semibold text-foreground">{studentInfo.name || "—"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Surname
                </label>
                <p className="text-lg font-semibold text-foreground">{studentInfo.surname || "—"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Gender
                </label>
                <p className="text-lg font-semibold text-foreground">{studentInfo.gender || "—"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Birthday
                </label>
                <p className="text-lg font-semibold text-foreground">
                  {studentInfo.birthday
                    ? new Date(studentInfo.birthday).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8 pb-8 border-b border-border">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </label>
                <p className="text-base font-medium text-foreground break-words">{studentInfo.email || "—"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  Phone
                </label>
                <p className="text-base font-medium text-foreground">{studentInfo.phone || "—"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </label>
                <p className="text-base font-medium text-foreground">{studentInfo.whatsapp || "—"}</p>
              </div>
            </div>
          </div>

          {/* Location & Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Info */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </h4>
              <div className="space-y-4">
                <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5" />
                    Citizenship
                  </label>
                  <p className="text-base font-semibold text-foreground">
                    {studentInfo.citizenship || "—"}
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Country of Residence
                  </label>
                  <p className="text-base font-semibold text-foreground">
                    {studentInfo.countryOfResidence || "—"}
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Full Address
                  </label>
                  <p className="text-base font-medium text-foreground break-words">{studentInfo.fullAddress || "—"}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents
              </h4>
              <div className="space-y-4">
                <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Passport Validity (in Months)
                  </label>
                  <p className="text-base font-medium text-foreground">
                    {studentInfo.passportValidity
                      ? `${studentInfo.passportValidity} months`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Welcome Section */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-foreground mb-2">Welcome Back, {studentInfo.name.split(" ")[0]}!</h3>
          <p className="text-muted-foreground">
            Track your journey with JEEXPERT across admission, visa, scholarship, and integration.
          </p>
        </div>

        {/* Paiement — accès rapide + résumé */}
        <Link href="/paiement" className="mb-8 block">
          <Card className="border-2 bg-card p-6 shadow-lg transition-colors hover:bg-muted/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-foreground">Paiement</h3>
                  <PaymentHomeSummary folderId={studentInfo.folderId ?? ""} email={studentInfo.email ?? ""} />
                </div>
              </div>
              <span className="text-sm font-semibold text-primary sm:shrink-0 sm:pt-1">Ouvrir →</span>
            </div>
          </Card>
        </Link>

        {/* Status Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatusCard
            title="Admission"
            status={admissionStatus}
            percentage={admissionPercentage}
            icon="📋"
            color="primary"
            onClick={() => setAdmissionModalOpen(true)}
            additionalContent={
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setAdmissionModalOpen(true)}
                  className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setApplicationsModalOpen(true)}
                  className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                >
                  Applications
                </Button>
              </>
            }
          />
          <StatusCard title="Visa" status="Not Started" percentage={0} icon="🛂" color="secondary" />
          <StatusCard title="Scholarship" status="Not Started" percentage={0} icon="🎓" color="accent" />
          <StatusCard title="Integration" status="Not Started" percentage={0} icon="🌍" color="primary" />
        </div>

        {/* Admission Details Modal */}
        <AdmissionDetails
          open={admissionModalOpen}
          onOpenChange={setAdmissionModalOpen}
          admissionData={studentInfo.admission}
        />

        {/* View Applications Modal */}
        <ViewApplications
          open={applicationsModalOpen}
          onOpenChange={setApplicationsModalOpen}
          prospectId={studentInfo.folderId}
        />
      </main>
    </div>
  )
}
