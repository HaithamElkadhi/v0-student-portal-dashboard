"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import StatusCard from "@/components/status-card"
import { LogOut, Mail, FolderOpen } from "lucide-react"

interface StudentInfo {
  name: string
  email: string
  folderId: string
}

interface StudentDashboardProps {
  onLogout: () => void
  studentInfo: StudentInfo
}

export default function StudentDashboard({ onLogout, studentInfo }: StudentDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">JEEXPERT</h1>
            <p className="text-sm text-muted-foreground">Student Portal</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Information Section */}
        <Card className="border-2 p-6 mb-8 bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                {studentInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">{studentInfo.name}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{studentInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm font-mono">{studentInfo.folderId}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Account Status</p>
              <p className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium w-fit">Active</p>
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

        {/* Status Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatusCard title="Admission" status="In Progress" percentage={65} icon="📋" color="primary" />
          <StatusCard title="Visa" status="Not Started" percentage={0} icon="🛂" color="secondary" />
          <StatusCard title="Scholarship" status="Completed" percentage={100} icon="🎓" color="accent" />
          <StatusCard title="Integration" status="Pending Review" percentage={45} icon="🌍" color="primary" />
        </div>

        {/* Recent Activity */}
        <Card className="border-2 p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem
              date="Dec 3, 2024"
              title="Admission documents reviewed"
              description="Your application has been reviewed by the admissions team"
              status="completed"
            />
            <ActivityItem
              date="Nov 28, 2024"
              title="Documents submitted"
              description="You have successfully submitted all required documents"
              status="completed"
            />
            <ActivityItem
              date="Nov 20, 2024"
              title="Application created"
              description="Your JEEXPERT application has been created"
              status="completed"
            />
          </div>
        </Card>
      </main>
    </div>
  )
}

function ActivityItem({
  date,
  title,
  description,
  status,
}: {
  date: string
  title: string
  description: string
  status: "completed" | "pending"
}) {
  return (
    <div className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${status === "completed" ? "bg-accent" : "bg-muted"}`} />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
        </div>
      </div>
    </div>
  )
}
