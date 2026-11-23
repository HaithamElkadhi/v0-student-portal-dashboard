import { NextRequest, NextResponse } from "next/server"
import { documentSession } from "@/lib/student-document-session"
import { documentRequest } from "@/lib/student-document-store"
import { AIRTABLE } from "@/lib/airtable-config"
import { loadStudentAccounts, applicationEmailFromAccounts } from "@/lib/student-linked-accounts"
import { studentPreparation } from "@/lib/student-preparation"

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" }
  const session = documentSession(request)
  if (!session || request.nextUrl.searchParams.get("folderId") !== session.folderId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401, headers })
  }
  try {
    const record = await documentRequest(AIRTABLE.tables.prospects.id + "/" + session.id + "?returnFieldsByFieldId=true")
    const fields = record.fields ?? {}
    const accounts = await loadStudentAccounts(session.id, fields)
    return NextResponse.json(studentPreparation(fields, applicationEmailFromAccounts(accounts)), { headers })
  } catch {
    return NextResponse.json({ error: "Suivi du test indisponible." }, { status: 502, headers })
  }
}
