import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
async function read(url: URL) {
  const res = await fetch(url, { headers: { Authorization: "Bearer " + getAirtableApiKey() }, cache: "no-store" })
  if (!res.ok) throw new Error("Accounts unavailable")
  return res.json()
}
export async function GET(request: NextRequest) {
  const prospectId = request.nextUrl.searchParams.get("prospectId")?.trim()
  if (!prospectId || !/^[a-zA-Z0-9_-]+$/.test(prospectId)) return NextResponse.json({ error: "Identifiant obligatoire." }, { status: 400 })
  try {
    const url = new URL("https://api.airtable.com/v0/" + AIRTABLE.baseId + "/" + AIRTABLE.tables.prospects.id)
    url.searchParams.set("filterByFormula", '{Prospect ID}="' + prospectId + '"')
    url.searchParams.set("returnFieldsByFieldId", "true")
    url.searchParams.set("maxRecords", "1")
    for (const field of ["flddNBP0jC3rYtcF0", "flduBzqGehqb5iu4f"]) url.searchParams.append("fields[]", field)
    const student = (await read(url)).records?.[0]
    if (!student) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 })
    const ids: string[] = (student.fields?.flddNBP0jC3rYtcF0 || []).filter((id: unknown) => typeof id === "string" && /^rec[a-zA-Z0-9]+$/.test(id))
    const accounts = []
    for (let index = 0; index < ids.length; index += 50) {
      const accountUrl = new URL("https://api.airtable.com/v0/" + AIRTABLE.baseId + "/tblEQbtTmVkMlTbUV")
      accountUrl.searchParams.set("filterByFormula", "OR(" + ids.slice(index,index+50).map(id => "RECORD_ID()='" + id + "'").join(",") + ")")
      accountUrl.searchParams.set("returnFieldsByFieldId", "true")
      for (const field of ["fld6GymQ8Gh6hQnwX","fldU8qYxw1o9pJaoF","flduaQtpEJlr03ivQ"]) accountUrl.searchParams.append("fields[]",field)
      const page = await read(accountUrl)
      for (const record of page.records || []) if (record.fields?.flduaQtpEJlr03ivQ?.includes(student.id)) accounts.push({
        id: record.id, username: record.fields.fld6GymQ8Gh6hQnwX || "", labels: record.fields.fldU8qYxw1o9pJaoF || [],
      })
    }
    return NextResponse.json({ applicationEmail: student.fields?.flduBzqGehqb5iu4f || "", accounts })
  } catch (error) {
    console.error("[student-accounts]", error)
    return NextResponse.json({ error: "Impossible de charger vos comptes." }, { status: 502 })
  }
}
