import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { findProspectByEmail } from "@/lib/airtable-prospects"

async function read(path: string) {
  const response = await fetch("https://api.airtable.com/v0/" + AIRTABLE.baseId + "/" + path, {
    headers: { Authorization: "Bearer " + getAirtableApiKey() }, cache: "no-store",
  })
  if (!response.ok) throw new Error("Airtable read failed")
  return response.json()
}
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim()
  if (!email) return NextResponse.json({ error: "E-mail obligatoire." }, { status: 400 })
  try {
    const id = await findProspectByEmail(email)
    if (!id) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 })
    const record = await read(AIRTABLE.tables.prospects.id + "/" + id + "?returnFieldsByFieldId=true")
    const f = record.fields || {}
    const ids: string[] = (f.fldNNUfBOKjPpP18l || []).filter((value: unknown) => typeof value === "string" && /^rec[a-zA-Z0-9]+$/.test(value))
    const applications: { university: string; program: string; status: string }[] = []
    for (let index = 0; index < ids.length; index += 50) {
      const formula = "OR(" + ids.slice(index, index + 50).map(value => "RECORD_ID()='" + value + "'").join(",") + ")"
      const params = new URLSearchParams({ filterByFormula: formula, returnFieldsByFieldId: "true" })
      for (const field of ["fldjZwpov9XRo3fRX", "fldQxBB0hjUhnRZyJ", "fldSQQ2PO9CInBxFG", "fldIVAzFqAqdtrTmN"]) params.append("fields[]", field)
      const page = await read("tblGP4mMaQs1XeVME?" + params)
      for (const app of page.records || []) if (app.fields?.fldjZwpov9XRo3fRX?.includes(id)) applications.push({ university: app.fields.fldQxBB0hjUhnRZyJ || "", program: app.fields.fldSQQ2PO9CInBxFG || "", status: app.fields.fldIVAzFqAqdtrTmN || "" })
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
    return NextResponse.json({
      admissionStatus: f.fldmuVhiN3wJyNNtF || [],
      approvedUniversity: f.fld2RAtd2zTwGx9S6 || "",
      applicationsCount: typeof f.fldWY2F7bmqqzRT7Q === "number" ? f.fldWY2F7bmqqzRT7Q : applications.length,
      admitted: applications.filter(app => app.status.trim() === "Admitted"),
      scholarshipStatus: f.fldRU8b7hEa0FTz7D || "",
      visaStatus: f.fldlO31JxYb7tM9Li || "",
      appointmentDate: f.fldFqV1HBszTl1XwD || "",
      mailCount, lastMail,
    })
  } catch (error) {
    console.error("[profile-summary]", error)
    return NextResponse.json({ error: "Impossible de charger le résumé de votre dossier." }, { status: 502 })
  }
}
