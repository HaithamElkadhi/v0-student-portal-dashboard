import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { findProspectByEmail } from "@/lib/airtable-prospects"
import { BOURSE_UPLOAD_FIELD_IDS } from "@/lib/bourse-documents-airtable"

async function getStudentDocuments(prospectId: string) {
  const table = AIRTABLE.tables.bourseDocuments
  const filesByField: Record<string, { name: string; url: string | null }[]> = {}
  let latest: { status: string | null; submissionDate: string | null } | null = null
  let offset: string | undefined
  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${table.id}`)
    url.searchParams.set("returnFieldsByFieldId", "true")
    url.searchParams.set("sort[0][field]", table.fields.submissionDate)
    url.searchParams.set("sort[0][direction]", "desc")
    for (const field of [table.fields.prospect, table.fields.dossierStatus, table.fields.submissionDate, ...Object.values(BOURSE_UPLOAD_FIELD_IDS)]) url.searchParams.append("fields[]", field)
    if (offset) url.searchParams.set("offset", offset)
    const response = await fetch(url, { headers: { Authorization: `Bearer ${getAirtableApiKey()}` }, cache: "no-store" })
    if (!response.ok) throw new Error("Scholarship documents fetch failed")
    const data = await response.json()
    for (const record of data.records ?? []) {
      const linked = record.fields?.[table.fields.prospect]
      if (!Array.isArray(linked) || !linked.includes(prospectId)) continue
      latest ??= { status: record.fields[table.fields.dossierStatus] ?? null, submissionDate: record.fields[table.fields.submissionDate] ?? null }
      for (const [key, field] of Object.entries(BOURSE_UPLOAD_FIELD_IDS)) {
        const attachments = record.fields[field]
        if (!Array.isArray(attachments)) continue
        for (const file of attachments) {
          (filesByField[key] ??= []).push({ name: String(file.filename || "Document").replace(/^BourseField_[a-zA-Z0-9_]+--/, ""), url: typeof file.url === "string" ? file.url : null })
        }
      }
    }
    offset = data.offset
  } while (offset)
  return latest ? { ...latest, filesByField } : null
}

const fields = {
  type: "fld50RAsGJ0ceD7gH", status: "fldRU8b7hEa0FTz7D",
  regionAuthority: "fld7692flEhPFJzz8", payment: "fldvaKgmQgNVwG5sF",
  submissionDate: "fldtJkT2buefXXRrK", deadline: "fldrXRWcTK3Dve4mu",
  documentFolder: "fldkFISclahSaCBOH",
} as const

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim()
  if (!email) return NextResponse.json({ error: "E-mail obligatoire." }, { status: 400 })
  try {
    const prospectId = await findProspectByEmail(email)
    if (!prospectId) return NextResponse.json({ scholarship: null, dossier: null })
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${AIRTABLE.tables.prospects.id}/${prospectId}?returnFieldsByFieldId=true`, {
      headers: { Authorization: `Bearer ${getAirtableApiKey()}` }, cache: "no-store",
    })
    if (!response.ok) throw new Error("Scholarship fetch failed")
    const record = await response.json()
    const scholarship = Object.fromEntries(Object.entries(fields).map(([key, id]) => [key, record.fields?.[id] ?? null]))
    const dossier = await getStudentDocuments(prospectId)
    return NextResponse.json({ scholarship, dossier })
  } catch (error) {
    console.error("[scholarship]", error)
    return NextResponse.json({ error: "Impossible de charger votre suivi de bourse. Réessayez." }, { status: 502 })
  }
}
