"use client"

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
}

export default function ViewApplications({ open, onOpenChange }: ViewApplicationsProps) {
  // Mock data - will be replaced with Airtable data later
  const mockApplications: Application[] = [
    {
      university: "University of Milan",
      course: "Computer Science",
      courseLanguage: "English",
      degreeLevel: "Master",
      campusCity: "Milan",
      dateOfCandidacy: "2024-01-15",
    },
    {
      university: "Sapienza University of Rome",
      course: "Data Science",
      courseLanguage: "Italian",
      degreeLevel: "Master",
      campusCity: "Rome",
      dateOfCandidacy: "2024-02-20",
    },
    {
      university: "University of Bologna",
      course: "Artificial Intelligence",
      courseLanguage: "English",
      degreeLevel: "Bachelor",
      campusCity: "Bologna",
      dateOfCandidacy: "2024-03-10",
    },
  ]

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
          {mockApplications.length === 0 ? (
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
                  {mockApplications.map((application, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{application.university}</TableCell>
                      <TableCell>{application.course}</TableCell>
                      <TableCell>{application.courseLanguage}</TableCell>
                      <TableCell>{application.degreeLevel}</TableCell>
                      <TableCell>{application.campusCity}</TableCell>
                      <TableCell>{formatDate(application.dateOfCandidacy)}</TableCell>
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

