import { jsPDF } from "jspdf"
import { mousad9aGuide as guide } from "@/lib/mousad9a-guide"

export function GET() {
  const pdf = new jsPDF()
  const margin = 18
  const width = pdf.internal.pageSize.getWidth() - margin * 2
  let y = 23

  function paragraph(text: string, size: number, bold = false) {
    pdf.setFont("helvetica", bold ? "bold" : "normal")
    pdf.setFontSize(size)
    pdf.setTextColor(bold ? "#173B65" : "#172D43")
    const lines: string[] = pdf.splitTextToSize(text, width)
    const lineHeight = size * 0.43
    pdf.text(lines, margin, y, { lineHeightFactor: 1.22 })
    y += lines.length * lineHeight + 2
  }

  pdf.setProperties({ title: guide.title, author: "JEEXPERT" })
  paragraph(guide.title, 19, true)
  paragraph(guide.introduction, 11)
  y += 4
  paragraph("À quelle administration vous adresser", 14, true)
  for (const [document, administration] of guide.administrations) {
    paragraph(document, 11, true)
    paragraph(administration, 11)
  }
  y += 4
  paragraph(guide.stepsTitle, 14, true)
  for (const [index, step] of guide.steps.entries()) {
    paragraph(`${index + 1}. ${step.title}`, 11, true)
    paragraph(step.text, 11)
  }
  y += 4
  paragraph("Exemple pour le baccalauréat", 14, true)
  paragraph(guide.example, 11)
  pdf.setTextColor("#173B65")
  pdf.setFontSize(10)
  pdf.textWithLink("Source officielle : Ambassade d’Italie à Tunis", margin, y + 2, { url: guide.source })

  return new Response(pdf.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="guide-mousad9a.pdf"',
    },
  })
}
