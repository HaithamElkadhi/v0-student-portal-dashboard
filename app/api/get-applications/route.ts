import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"

const table = "tblGP4mMaQs1XeVME"
const studentLink = "fldjZwpov9XRo3fRX"
const fields = {
  university: "fldQxBB0hjUhnRZyJ", course: "fldSQQ2PO9CInBxFG",
  courseLanguage: "fldSZUUcWnWspMgz0", degreeLevel: "fldsK9b7mzUUCqFwX",
  campusCity: "fldQyeEk9hMymvJoo", dateOfCandidacy: "fldFDzhe6oIWNsMAR",
  applicationStatus: "fldIVAzFqAqdtrTmN", comment: "fldYSRpaYJdx1Ikuc",
} as const
async function read(url: URL) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${getAirtableApiKey()}` }, cache: "no-store" })
  if (!response.ok) throw new Error("Applications lookup failed")
  return response.json()
}
export async function POST(request: NextRequest) {
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }) }
  const prospectId = typeof body.prospectId === "string" ? body.prospectId.trim() : ""
  if (!/^[a-zA-Z0-9_-]+$/.test(prospectId)) return NextResponse.json({ error: "Identifiant de dossier obligatoire." }, { status: 400 })
  try {
    const prospectUrl = new URL(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${AIRTABLE.tables.prospects.id}`)
    prospectUrl.searchParams.set("filterByFormula", `{Prospect ID}="${prospectId}"`)
    prospectUrl.searchParams.set("returnFieldsByFieldId", "true")
    prospectUrl.searchParams.set("maxRecords", "2")
    prospectUrl.searchParams.append("fields[]", "fldNNUfBOKjPpP18l")
    const prospects = await read(prospectUrl)
    if (prospects.records.length !== 1) return NextResponse.json({ error: "Dossier étudiant introuvable ou ambigu." }, { status: 404 })
    const student = prospects.records[0]
    const ids: string[] = (student.fields.fldNNUfBOKjPpP18l ?? []).filter((id: unknown) => typeof id === "string" && /^rec[a-zA-Z0-9]+$/.test(id))
    const applications: Record<string, string>[] = []
    for (let index = 0; index < ids.length; index += 50) {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${table}`)
      url.searchParams.set("filterByFormula", `OR(${ids.slice(index, index + 50).map(id => `RECORD_ID()="${id}"`).join(",")})`)
      url.searchParams.set("returnFieldsByFieldId", "true")
      for (const field of [studentLink, ...Object.values(fields)]) url.searchParams.append("fields[]", field)
      const page = await read(url)
      for (const record of page.records ?? []) {
        if (!record.fields[studentLink]?.includes(student.id)) continue
        applications.push(Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, String(record.fields[field] ?? "")])))
      }
    }
    return NextResponse.json({ success: true, applications })
  } catch {
    return NextResponse.json({ error: "Impossible de charger vos candidatures. Réessayez." }, { status: 502 })
  }
}
