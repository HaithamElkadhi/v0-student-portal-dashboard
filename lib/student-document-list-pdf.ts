import { jsPDF } from "jspdf"
import type { RequiredDocument } from "@/lib/student-document-requirements"

export function buildStudentDocumentListPdf(documents: RequiredDocument[]) {
  const pdf = new jsPDF()
  const margin = 18
  const width = pdf.internal.pageSize.getWidth() - margin * 2
  const bottom = pdf.internal.pageSize.getHeight() - margin
  const checkboxSize = 4
  const textIndent = 8
  let y = margin

  function writeHeader() {
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(19)
    pdf.setTextColor("#173B65")
    pdf.text("Liste des documents", margin, margin + 7)
    pdf.setDrawColor("#80C4EA")
    pdf.line(margin, margin + 12, margin + width, margin + 12)
    y = margin + 22
  }

  function ensureSpace(height: number) {
    if (y + height > bottom) {
      pdf.addPage()
      writeHeader()
    }
  }

  pdf.setProperties({ title: "Liste des documents", author: "JEEXPERT" })
  writeHeader()
  for (const document of documents) {
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    const lines: string[] = pdf.splitTextToSize(document.name, width - textIndent)
    ensureSpace(Math.min(lines.length * 5 + 4, bottom - margin - 22))
    pdf.setDrawColor("#173B65")
    pdf.rect(margin, y - 3.2, checkboxSize, checkboxSize)
    for (const line of lines) {
      ensureSpace(5)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(11)
      pdf.setTextColor("#172D43")
      pdf.text(line, margin + textIndent, y)
      y += 5
    }
    y += 4
  }

  return pdf
}
