import { NextRequest, NextResponse } from "next/server"
import { documentSession } from "@/lib/student-document-session"
import { documentRequest } from "@/lib/student-document-store"
import { AIRTABLE, readApplicationEmail } from "@/lib/airtable-config"

import { loadStudentAccounts, applicationEmailFromAccounts } from "@/lib/student-linked-accounts"

const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie" },
})

export async function GET(request: NextRequest) {
  const session = documentSession(request)
  if (!session || request.nextUrl.searchParams.get("folderId") !== session.folderId) {
    return json({ error: "Veuillez vous reconnecter pour consulter vos identifiants." }, 401)
  }
  try {
    const student = await documentRequest(AIRTABLE.tables.prospects.id + "/" + session.id + "?returnFieldsByFieldId=true")
    const accounts = await loadStudentAccounts(session.id, student.fields ?? {}, true)
    return json({ applicationEmail: applicationEmailFromAccounts(accounts) || readApplicationEmail(student.fields), accounts: accounts.map(({ id, username, labels, password, url }) => ({ id, username, labels, password, url })) })
  } catch {
    return json({ error: "Impossible de charger vos identifiants. Réessayez." }, 502)
  }
}
