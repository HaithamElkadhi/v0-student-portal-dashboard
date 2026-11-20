import { NextRequest, NextResponse } from "next/server"
import { documentSession } from "@/lib/student-document-session"
import { documentRequest } from "@/lib/student-document-store"
import { AIRTABLE } from "@/lib/airtable-config"

const fields = {
  username: "fld6GymQ8Gh6hQnwX",
  labels: "fldU8qYxw1o9pJaoF",
  owner: "flduaQtpEJlr03ivQ",
  link: "fld4kKOkH1VvqUfUk",
  password: "fld18yBzVSD5BtP3y",
}
type Record = { id: string; fields: { [key: string]: unknown } }
const text = (value: unknown) => typeof value === "string" ? value : ""

function safeUrl(value: unknown) {
  try {
    const url = new URL(text(value))
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""
  } catch { return "" }
}
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
    const linked = student.fields?.flddNBP0jC3rYtcF0
    const ids: string[] = Array.isArray(linked)
      ? [...new Set(linked.filter((id): id is string => typeof id === "string" && /^rec[a-zA-Z0-9]+$/.test(id)))]
      : []
    const accounts = []
    for (let index = 0; index < ids.length; index += 50) {
      const params = new URLSearchParams({
        returnFieldsByFieldId: "true",
        filterByFormula: "OR(" + ids.slice(index, index + 50).map(id => `RECORD_ID()='${id}'`).join(",") + ")",
      })
      const page = await documentRequest("tblEQbtTmVkMlTbUV?" + params)
      for (const record of (page.records ?? []) as Record[]) {
        const owner = record.fields[fields.owner]
        if (!ids.includes(record.id) || !Array.isArray(owner) || !owner.includes(session.id)) continue
        const labels = record.fields[fields.labels]
        accounts.push({
          id: record.id,
          username: text(record.fields[fields.username]),
          labels: Array.isArray(labels) ? labels.filter((label): label is string => typeof label === "string") : [],
          password: text(record.fields[fields.password]),
          url: safeUrl(record.fields[fields.link]),
        })
      }
    }
    return json({ applicationEmail: text(student.fields?.flduBzqGehqb5iu4f), accounts })
  } catch {
    return json({ error: "Impossible de charger vos identifiants. Réessayez." }, 502)
  }
}
