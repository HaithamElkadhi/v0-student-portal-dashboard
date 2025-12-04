"use client"

import { useState } from "react"
import AdminLogin from "@/components/admin-login"
import StudentVerification from "@/components/student-verification"
import StudentDashboard from "@/components/student-dashboard"

export default function Page() {
  const [currentPage, setCurrentPage] = useState("login-selection")
  const [userRole, setUserRole] = useState<"student" | "admin" | null>(null)
  const [studentInfo, setStudentInfo] = useState<{
    name: string
    email: string
    folderId: string
  } | null>(null)

  const handleStudentClick = () => {
    setUserRole("student")
    setCurrentPage("student-verification")
  }

  const handleStudentVerified = (info: { name: string; email: string; folderId: string }) => {
    setStudentInfo(info)
    setCurrentPage("student-dashboard")
  }

  const handleAdminLogin = () => {
    setUserRole("admin")
    setCurrentPage("admin-login")
  }

  const handleLogout = () => {
    setCurrentPage("login-selection")
    setUserRole(null)
    setStudentInfo(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {currentPage === "login-selection" && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoginSelection onStudentClick={handleStudentClick} onAdminClick={handleAdminLogin} />
        </div>
      )}
      {currentPage === "student-verification" && userRole === "student" && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <StudentVerification
            onSuccess={handleStudentVerified}
            onBack={() => {
              setCurrentPage("login-selection")
              setUserRole(null)
            }}
          />
        </div>
      )}
      {currentPage === "student-dashboard" && userRole === "student" && studentInfo && (
        <StudentDashboard onLogout={handleLogout} studentInfo={studentInfo} />
      )}
      {currentPage === "admin-login" && userRole === "admin" && <AdminLogin onBack={handleLogout} />}
    </main>
  )
}

function LoginSelection({ onStudentClick, onAdminClick }: { onStudentClick: () => void; onAdminClick: () => void }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">JEEXPERT</h1>
        <p className="text-lg text-muted-foreground">Student Portal</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={onStudentClick}
          className="group p-8 rounded-xl bg-card border-2 border-border hover:border-primary transition-all duration-300 text-left hover:shadow-lg"
        >
          <div className="mb-4 w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
            S
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            Student Login
          </h2>
          <p className="text-muted-foreground">Access your admission, visa, and scholarship status</p>
        </button>

        <button
          onClick={onAdminClick}
          className="group p-8 rounded-xl bg-card border-2 border-border hover:border-secondary transition-all duration-300 text-left hover:shadow-lg"
        >
          <div className="mb-4 w-12 h-12 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
            A
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">
            Admin Portal
          </h2>
          <p className="text-muted-foreground">Manage student applications and track progress</p>
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12">Secure portal for JEEXPERT student management</p>
    </div>
  )
}
