import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey, readApplicationEmail } from "@/lib/airtable-config"
import { applicationEmailFromAccounts, loadStudentAccounts } from "@/lib/student-linked-accounts"
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
    const accounts = await loadStudentAccounts(student.id, student.fields ?? {})
    return NextResponse.json({
      applicationEmail: applicationEmailFromAccounts(accounts) || readApplicationEmail(student.fields),
      accounts: accounts.map(({ id, username, labels }) => ({ id, username, labels })),
    })
  } catch (error) {
    console.error("[student-accounts]", error)
    return NextResponse.json({ error: "Impossible de charger vos comptes." }, { status: 502 })
  }
}
