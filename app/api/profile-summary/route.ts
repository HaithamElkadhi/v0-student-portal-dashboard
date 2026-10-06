import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { studentContactActivity } from "@/lib/student-contact-activity"
import { findProspectByEmail } from "@/lib/airtable-prospects"

async function read(path: string) {
  const response = await fetch("https://api.airtable.com/v0/" + AIRTABLE.baseId + "/" + path, {
    headers: { Authorization: "Bearer " + getAirtableApiKey() }, cache: "no-store",
  })
  if (!response.ok) throw new Error("Airtable read failed")
  return response.json()
}
function textValue(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (Array.isArray(value)) return value.filter(item => typeof item === "string").join(" · ")
  return ""
}
function listValue(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === "string" && !!item.trim()).map(item => item.trim())
}
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim()
  if (!email) return NextResponse.json({ error: "E-mail obligatoire." }, { status: 400 })
  try {
    const id = await findProspectByEmail(email)
    if (!id) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 })
    const record = await read(AIRTABLE.tables.prospects.id + "/" + id + "?returnFieldsByFieldId=true")
    const f = record.fields || {}
    const ids = listValue(f.fldNNUfBOKjPpP18l).filter(value => /^rec[a-zA-Z0-9]+$/.test(value))
    const applications: { university: string; program: string; status: string }[] = []
    for (let index = 0; index < ids.length; index += 50) {
      const formula = "OR(" + ids.slice(index, index + 50).map(value => "RECORD_ID()='" + value + "'").join(",") + ")"
      const params = new URLSearchParams({ filterByFormula: formula, returnFieldsByFieldId: "true" })
      for (const field of ["fldjZwpov9XRo3fRX", "fldQxBB0hjUhnRZyJ", "fldSQQ2PO9CInBxFG", "fldIVAzFqAqdtrTmN"]) params.append("fields[]", field)
      const page = await read("tblGP4mMaQs1XeVME?" + params)
      for (const app of page.records || []) if (app.fields?.fldjZwpov9XRo3fRX?.includes(id)) applications.push({ university: textValue(app.fields.fldQxBB0hjUhnRZyJ), program: textValue(app.fields.fldSQQ2PO9CInBxFG), status: textValue(app.fields.fldIVAzFqAqdtrTmN) })
    }
    let mailCount: number | null = 0
    let lastMail: { subject: string; date: string } | null = null
    try {
      const formula = "AND({Student Record ID}='" + id + "',{Action}='Email',{Result}='Sent')"
      let offset: string | undefined
      do {
        const params = new URLSearchParams({ filterByFormula: formula, "sort[0][field]": "Occurred At", "sort[0][direction]": "desc" })
        for (const field of ["Recipient", "Subject", "Occurred At"]) params.append("fields[]", field)
        if (offset) params.set("offset", offset)
        const page = await read("tblRmPz47Tclxz3od?" + params)
        for (const event of page.records || []) {
          if (String(event.fields?.Recipient || "").trim().toLowerCase() !== email.toLowerCase()) continue
          mailCount++
          lastMail ??= { subject: event.fields.Subject || "Message de votre conseiller", date: event.fields["Occurred At"] || "" }
        }
        offset = page.offset
      } while (offset)
    } catch { mailCount = null }
    const activity = await studentContactActivity(read, id, email, textValue(f.fldZUcZ5HyfWP7aGJ))
    return NextResponse.json({
      activity: activity.events, activityPartial: activity.partial,
      admissionStatus: listValue(f.fldmuVhiN3wJyNNtF),
      approvedUniversity: textValue(f.fld2RAtd2zTwGx9S6),
      applicationsCount: typeof f.fldWY2F7bmqqzRT7Q === "number" ? f.fldWY2F7bmqqzRT7Q : applications.length,
      decisions: applications,
      admitted: applications.filter(app => app.status.trim() === "Admitted"),
      scholarshipStatus: textValue(f.fldRU8b7hEa0FTz7D),
      visaStatus: textValue(f.fldlO31JxYb7tM9Li),
      appointmentDate: textValue(f.fldFqV1HBszTl1XwD),
      lastContactDate: textValue(f.fldMNqg6mBhMVRlaE),
      lastContactReason: textValue(f.fldKDLzHwYQQ8vWsm),
      mailCount, lastMail,
    })
  } catch (error) {
    console.error("[profile-summary]", error)
    return NextResponse.json({ error: "Impossible de charger le résumé de votre dossier." }, { status: 502 })
  }
}
