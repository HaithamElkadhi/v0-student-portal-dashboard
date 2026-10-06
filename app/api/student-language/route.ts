import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { findProspectByEmail } from "@/lib/airtable-prospects"
import { LANGUAGE_TABLE as table, LANGUAGE_FIELDS as F, languageOptions, type LanguageProof } from "@/lib/language-proofs"
const headers = () => ({ Authorization: `Bearer ${getAirtableApiKey()}`, "Content-Type": "application/json" })
async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: headers(), cache: "no-store" })
  if (!res.ok) throw new Error("Airtable request failed")
  return res.json()
}
const root = `https://api.airtable.com/v0/${AIRTABLE.baseId}`
async function student(email: string, folderId: string) {
  if (!email || !/^[a-zA-Z0-9_-]+$/.test(folderId)) return null
  const id = await findProspectByEmail(email)
  if (!id) return null
  const record = await call(`${root}/${AIRTABLE.tables.prospects.id}/${id}?returnFieldsByFieldId=true`)
  return record.fields.fldy26xuJG1jxUrxL === folderId ? record : null
}
function proof(record: any): LanguageProof {
  const f = record.fields
  return { id: record.id, language: f[F.language], type: f[F.type], score: f[F.score] ?? "", date: f[F.date] ?? "", institution: f[F.institution] ?? "", detail: f[F.detail] ?? "", documents: (f[F.documents] ?? []).map((d: any) => ({ name: d.filename, url: d.url })) }
}
async function list(owner: any, folderId: string) {
  const ids: string[] = owner.fields.fld4OLaMH2ysiWjUC ?? []
  const proofs: LanguageProof[] = []
  for (let i = 0; i < ids.length; i += 20) {
    const url = new URL(`${root}/${table}`)
    url.searchParams.set("returnFieldsByFieldId", "true")
    url.searchParams.set("filterByFormula", `OR(${ids.slice(i, i + 20).map(id => `RECORD_ID()="${id}"`).join(",")})`)
    const data = await call(url.href)
    proofs.push(...data.records.filter((r: any) => r.fields[F.prospect]?.includes(owner.id)).map(proof))
  }
  const url = new URL(`${root}/tblLWLiwFS2Cn3sbo`)
  url.searchParams.set("filterByFormula", `{Prospect ID}="${folderId}"`)
  url.searchParams.set("returnFieldsByFieldId", "true")
  const old = await call(url.href)
  for (const r of old.records) {
    for (const [type, doc, score, language] of [["ef_legacy", "fldfq3GHePP549ROj", "fld6tAZwQ2tLQKFU1", "english"], ["ielts", "fldpJalULvbfdB5mg", "fldIJUYRfOwSzUfFT", "english"], ["other_en", "fldbNyWnYDNDHi7Kw", "", "english"], ["other_it", "fldQWBGYkKduxlRHu", "", "italian"]]) {
      if (!r.fields[doc]?.length && r.fields[score] === undefined) continue
      proofs.push({ id: r.id + "_" + type, type, language: language as LanguageProof["language"], score: String(r.fields[score] ?? ""), date: "", institution: "", detail: "Justificatif précédemment enregistré", legacy: true, documents: (r.fields[doc] ?? []).map((d: any) => ({ name: d.filename, url: d.url })) })
    }
  }
  return proofs
}
export async function GET(req: NextRequest) {
  try {
    const folderId = req.nextUrl.searchParams.get("folderId") ?? ""
    const owner = await student(req.nextUrl.searchParams.get("email") ?? "", folderId)
    if (!owner) return NextResponse.json({ error: "Dossier étudiant introuvable." }, { status: 403 })
    return NextResponse.json({ proofs: await list(owner, folderId) })
  } catch { return NextResponse.json({ error: "Impossible de charger les justificatifs." }, { status: 502 }) }
}
export async function POST(req: NextRequest) {
  let savedId = ""
  try {
    const form = await req.formData()
    const input = Object.fromEntries(["email", "folderId", "id", "type", "score", "date", "institution", "detail"].map(key => [key, String(form.get(key) ?? "").trim()]))
    const option = languageOptions.find(o => o.id === input.type)
    const file = form.get("file")
    const validDate = !input.date || (/^\d{4}-\d{2}-\d{2}$/.test(input.date) && !Number.isNaN(Date.parse(input.date)) && new Date(input.date).toISOString().slice(0, 10) === input.date)
    if (!option || input.score.length > 100 || input.institution.length > 250 || input.detail.length > 500 || !validDate || (input.id && !/^rec[a-zA-Z0-9]+$/.test(input.id))) return NextResponse.json({ error: "Informations invalides." }, { status: 400 })
    if (input.type.startsWith("ef") && input.score && (!/^\d+$/.test(input.score) || Number(input.score) > 100)) return NextResponse.json({ error: "Score EF : entier entre 0 et 100." }, { status: 400 })
    if (input.type === "ielts" && input.score && (!/^\d(\.\d)?$/.test(input.score) || Number(input.score) > 9 || Number(input.score) * 2 % 1 !== 0)) return NextResponse.json({ error: "Score IELTS : de 0 à 9, par demi-point." }, { status: 400 })
    if (file !== null && (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name))) return NextResponse.json({ error: "PDF, JPG ou PNG de 5 Mo maximum." }, { status: 400 })
    const owner = await student(input.email, input.folderId)
    if (!owner) return NextResponse.json({ error: "Ce dossier ne correspond pas à votre e-mail." }, { status: 403 })
    if (input.id) {
      const existing = await call(`${root}/${table}/${input.id}?returnFieldsByFieldId=true`)
      if (!existing.fields[F.prospect]?.includes(owner.id)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
      if (existing.fields[F.type] !== input.type) return NextResponse.json({ error: "Ajoutez un nouveau justificatif pour changer de test." }, { status: 400 })
    }
    const values = { [F.name]: `${input.folderId} — ${option.label}`, [F.prospect]: [owner.id], [F.language]: option.language, [F.type]: option.id, [F.score]: option.studies ? "" : input.score, [F.date]: input.date || null, [F.institution]: input.institution, [F.detail]: input.detail }
    const saved = await call(`${root}/${table}${input.id ? "/" + input.id : ""}`, { method: input.id ? "PATCH" : "POST", body: JSON.stringify({ fields: values }) })
    savedId = saved.id
    if (file instanceof File) {
      await call(`https://content.airtable.com/v0/${AIRTABLE.baseId}/${saved.id}/${F.documents}/uploadAttachment`, { method: "POST", body: JSON.stringify({ contentType: file.type, filename: file.name, file: Buffer.from(await file.arrayBuffer()).toString("base64") }) })
    }
    return NextResponse.json({ proof: proof(await call(`${root}/${table}/${saved.id}?returnFieldsByFieldId=true`)) })
  } catch { return NextResponse.json({ id: savedId || undefined, error: savedId ? "Informations enregistrées. Le chargement du document a échoué : réessayez." : "Impossible d’enregistrer. Réessayez." }, { status: 502 }) }
}
