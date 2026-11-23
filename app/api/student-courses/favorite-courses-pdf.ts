import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { jsPDF } from "jspdf"

export async function favoriteCoursesPdf(favorites: Set<string>) {
  const catalog: string[][] = JSON.parse(
    await readFile(join(process.cwd(), "public/course-finder/catalog.json"), "utf8"),
  )
  const courses = catalog.filter(row => favorites.has(row[0]))
    .sort((a, b) => (a[2] || a[1]).localeCompare(b[2] || b[1]))
  const pdf = new jsPDF()
  const margin = 18
  const width = pdf.internal.pageSize.getWidth() - margin * 2
  const bottom = pdf.internal.pageSize.getHeight() - margin
  let y = margin

  function paragraph(text: string, bold = false, size = 11) {
    pdf.setFont("helvetica", bold ? "bold" : "normal")
    pdf.setFontSize(size)
    pdf.setTextColor(bold ? "#173B65" : "#172D43")
    for (const line of pdf.splitTextToSize(text, width) as string[]) {
      if (y > bottom) {
        pdf.addPage()
        y = margin
      }
      pdf.text(line, margin, y)
      y += size * 0.43
    }
    y += 2
  }

  pdf.setProperties({ title: "Favorite courses", author: "JEEXPERT" })
  paragraph("JEEXPERT | Favorite courses", true, 19)
  paragraph(`${favorites.size} saved ${favorites.size === 1 ? "course" : "courses"}`)
  const found = new Set<string>()
  for (const row of courses) {
    const [id, italian, english, university, campus, degree, language] = row
    found.add(id)
    if (y + 20 > bottom) {
      pdf.addPage()
      y = margin
    }
    paragraph(english || italian || "Course name unavailable", true, 13)
    const details = [university, campus, degree, language].filter(Boolean)
    if (details.length) paragraph(details.join(" | "))
    const application = [row[23], row[22] && "Deadline " + row[22], row[21] && "Fee " + row[21]].filter(Boolean)
    if (application.length) paragraph(application.join(" | "))
    y += 4
  }
  for (const id of favorites) {
    if (!found.has(id)) paragraph("Course unavailable in the current catalog (" + id + ")")
  }

  return new Response(pdf.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="jeexpert-favorite-courses.pdf"',
      "Cache-Control": "private, no-store",
    },
  })
}
