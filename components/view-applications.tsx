"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Application {
  university: string
  course: string
  courseLanguage: string
  degreeLevel: string
  campusCity: string
  dateOfCandidacy: string
}

interface ViewApplicationsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectId: string
}

export default function ViewApplications({ open, onOpenChange, prospectId }: ViewApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && prospectId) {
      fetchApplications()
    } else {
      // Reset when modal closes
      setApplications([])
      setError(null)
    }
  }, [open, prospectId])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/get-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prospectId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch applications")
      }

      if (data.success) {
        setApplications(data.applications || [])
      } else {
        throw new Error(data.error || "Failed to fetch applications")
      }
    } catch (err) {
      console.error("Error fetching applications:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Applications</DialogTitle>
          <DialogDescription>View all your university applications</DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>University</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Course Language</TableHead>
                    <TableHead>Degree Level</TableHead>
                    <TableHead>Campus City</TableHead>
                    <TableHead>Date of Candidacy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{application.university || "—"}</TableCell>
                      <TableCell>{application.course || "—"}</TableCell>
                      <TableCell>{application.courseLanguage || "—"}</TableCell>
                      <TableCell>{application.degreeLevel || "—"}</TableCell>
                      <TableCell>{application.campusCity || "—"}</TableCell>
                      <TableCell>{application.dateOfCandidacy ? formatDate(application.dateOfCandidacy) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

