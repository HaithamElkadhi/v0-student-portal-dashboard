import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { findProspectByEmail } from "@/lib/airtable-prospects"
const field = "fld3E5UlY00NyNaDx"
const headers = () => ({ Authorization: `Bearer ${getAirtableApiKey()}`, "Content-Type": "application/json" })
async function student(email: string, folderId: string) {
  if (!email || !/^[a-zA-Z0-9_-]+$/.test(folderId)) return null
  const id = await findProspectByEmail(email)
  if (!id) return null
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${AIRTABLE.tables.prospects.id}/${id}?returnFieldsByFieldId=true`, { headers: headers(), cache: "no-store" })
  if (!res.ok) throw new Error("Student lookup failed")
  const record = await res.json()
  return record.fields.fldy26xuJG1jxUrxL === folderId ? record : null
}
function documents(record: any) {
  return (record.fields[field] ?? []).map((file: any) => ({ id: file.id, name: file.filename, url: file.url }))
}
export async function GET(req: NextRequest) {
  try {
    const record = await student(req.nextUrl.searchParams.get("email") ?? "", req.nextUrl.searchParams.get("folderId") ?? "")
    if (!record) return NextResponse.json({ error: "Dossier étudiant introuvable." }, { status: 403 })
    return NextResponse.json({ documents: documents(record) })
  } catch { return NextResponse.json({ error: "Impossible de charger vos documents." }, { status: 502 }) }
}
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name)) return NextResponse.json({ error: "Choisissez un PDF, JPG ou PNG de 5 Mo maximum." }, { status: 400 })
    const record = await student(String(form.get("email") ?? ""), String(form.get("folderId") ?? ""))
    if (!record) return NextResponse.json({ error: "Ce dossier ne correspond pas à votre e-mail." }, { status: 403 })
    const res = await fetch(`https://content.airtable.com/v0/${AIRTABLE.baseId}/${record.id}/${field}/uploadAttachment`, { method: "POST", headers: headers(), body: JSON.stringify({ contentType: file.type, filename: file.name, file: Buffer.from(await file.arrayBuffer()).toString("base64") }) })
    if (!res.ok) throw new Error("Upload failed")
    const data = await res.json()
    return NextResponse.json({ success: true, documents: documents(data) })
  } catch { return NextResponse.json({ error: "Le document n’a pas pu être enregistré. Réessayez." }, { status: 502 }) }
}
