import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { findProspectByEmail } from "@/lib/airtable-prospects"

const table = "tblLWLiwFS2Cn3sbo"
const fields = { ef: { certificate: "fldfq3GHePP549ROj", score: "fld6tAZwQ2tLQKFU1" }, ielts: { certificate: "fldpJalULvbfdB5mg", score: "fldIJUYRfOwSzUfFT" } }
const headers = () => ({ Authorization: `Bearer ${getAirtableApiKey()}`, "Content-Type": "application/json" })
async function student(email: string, folderId: string) {
  if (!email || !/^[a-zA-Z0-9_-]+$/.test(folderId)) return null
  const id = await findProspectByEmail(email)
  if (!id) return null
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${AIRTABLE.tables.prospects.id}/${id}?returnFieldsByFieldId=true`, { headers: headers(), cache: "no-store" })
  if (!res.ok) throw new Error("Student lookup failed")
  const data = await res.json()
  return data.fields.fldy26xuJG1jxUrxL === folderId ? data : null
}
async function folder(folderId: string) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${table}`)
  url.searchParams.set("filterByFormula", `{Prospect ID}="${folderId}"`)
  url.searchParams.set("returnFieldsByFieldId", "true")
  url.searchParams.set("maxRecords", "2")
  const res = await fetch(url, { headers: headers(), cache: "no-store" })
  if (!res.ok) throw new Error("Folder lookup failed")
  const data = await res.json()
  if (data.records.length > 1) throw new Error("Multiple folders for this student")
  return data.records[0]
}
function payload(record: any) {
  const values = record?.fields ?? {}
  return Object.fromEntries(Object.entries(fields).map(([key, f]) => [key, { score: String(values[f.score] ?? ""), certificates: (values[f.certificate] ?? []).map((file: any) => ({ name: file.filename, url: file.url })) }]))
}
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email") ?? ""
    const folderId = req.nextUrl.searchParams.get("folderId") ?? ""
    if (!await student(email, folderId)) return NextResponse.json({ error: "Dossier étudiant introuvable." }, { status: 403 })
    return NextResponse.json(payload(await folder(folderId)))
  } catch { return NextResponse.json({ error: "Impossible de charger les certificats." }, { status: 502 }) }
}
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const email = String(form.get("email") ?? "").trim()
    const folderId = String(form.get("folderId") ?? "").trim()
    const kind = String(form.get("kind"))
    const score = String(form.get("score") ?? "").trim()
    const file = form.get("file")
    if (!(kind === "ef" || kind === "ielts") || score.length > 100 || (kind === "ef" && score !== "" && (!/^\d+$/.test(score) || Number(score) > 100))) return NextResponse.json({ error: "Score invalide." }, { status: 400 })
    if (file !== null && (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name))) return NextResponse.json({ error: "Choisissez un PDF, JPG ou PNG de 5 Mo maximum." }, { status: 400 })
    const owner = await student(email, folderId)
    if (!owner) return NextResponse.json({ error: "Ce dossier ne correspond pas à votre e-mail." }, { status: 403 })
    let record = await folder(folderId)
    if (!record) {
      const created = await fetch(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${table}`, { method: "POST", headers: headers(), body: JSON.stringify({ fields: { fldJOHpBcdM6hdjIi: folderId, fldHHUw7WWoInVVxy: owner.fields[AIRTABLE.tables.prospects.fields.name] ?? "", fldHRhEJ4dbg3jr0Z: owner.fields[AIRTABLE.tables.prospects.fields.surname] ?? "" } }) })
      if (!created.ok) throw new Error("Folder creation failed")
      record = await created.json()
    }
    // Save the score first; a failed upload can be retried without duplicating a certificate.
    const saved = await fetch(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${table}/${record.id}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ fields: { [fields[kind].score]: score === "" ? null : kind === "ef" ? Number(score) : score } }) })
    if (!saved.ok) throw new Error("Score save failed")
    if (file instanceof File) {
      const uploaded = await fetch(`https://content.airtable.com/v0/${AIRTABLE.baseId}/${record.id}/${fields[kind].certificate}/uploadAttachment`, { method: "POST", headers: headers(), body: JSON.stringify({ contentType: file.type, filename: file.name, file: Buffer.from(await file.arrayBuffer()).toString("base64") }) })
      if (!uploaded.ok) return NextResponse.json({ error: "Score enregistré, mais le certificat n’a pas pu être ajouté. Réessayez." }, { status: 502 })
    }
    return NextResponse.json(payload(await folder(folderId)))
  } catch { return NextResponse.json({ error: "Impossible d’enregistrer. Réessayez." }, { status: 502 }) }
}
