import "server-only"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { findProspectByEmail } from "@/lib/airtable-prospects"
import { initialAdmissionData, type AdmissionFormData, type DiplomaLevel, type ProgramType } from "@/components/admission-dossier/types"
import { docIdFromFilename } from "@/lib/admission-airtable"
export const F = AIRTABLE.tables.documents.fields
export const P = { target: "fldiIXhVLGlOYfNEX", phone: "fldx6RMeRYPWC9BV3", year: "fldsot30LGlll8oss", diploma: "fldW153lo9sB8qUSH", level: "fldGeykWH8oKFr03M", studyField: "fldLL6037ymaLuT5m", language: "fldGVRtZ7aFnr5KM0" }
export const root = `https://api.airtable.com/v0/${AIRTABLE.baseId}`
export async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${getAirtableApiKey()}`, "Content-Type": "application/json" }, cache: "no-store" })
  if (!res.ok) throw new Error("Impossible de joindre Airtable.")
  return res.json()
}
export async function owner(email: string, folderId: string) {
  if (!email || !/^[a-zA-Z0-9_-]+$/.test(folderId)) return null
  const id = await findProspectByEmail(email)
  if (!id) return null
  const record = await call(`${root}/${AIRTABLE.tables.prospects.id}/${id}?returnFieldsByFieldId=true`)
  return record.fields.fldy26xuJG1jxUrxL === folderId ? record : null
}
export async function dossier(id: string, studentId: string) {
  if (!/^rec[a-zA-Z0-9]+$/.test(id)) return null
  const record = await call(`${root}/${AIRTABLE.tables.documents.id}/${id}?returnFieldsByFieldId=true`)
  return record.fields[F.prospect]?.includes(studentId) ? record : null
}
export async function existing(email: string, studentId: string) {
  const url = new URL(`${root}/${AIRTABLE.tables.documents.id}`)
  url.searchParams.set("filterByFormula", `LOWER({Email})=LOWER("${email.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`)
  url.searchParams.set("returnFieldsByFieldId", "true")
  url.searchParams.set("sort[0][field]", F.submissionDate)
  url.searchParams.set("sort[0][direction]", "desc")
  let offset: string | undefined
  do {
    if (offset) url.searchParams.set("offset", offset)
    const data = await call(url.href)
    const record = data.records.find((r: any) => r.fields[F.prospect]?.includes(studentId))
    if (record) return record
    offset = data.offset
  } while (offset)
  return null
}
const program = (value: unknown): ProgramType => { const v = String(value ?? "").toLowerCase(); return v.includes("bachelor") || v.includes("triennale") ? "Laurea Triennale (Bachelor's)" : v.includes("master") || v.includes("magistrale") ? "Laurea Magistrale (Master's)" : v.includes("phd") || v.includes("doctor") || v.includes("dottor") ? "Dottorato (PhD)" : "" }
const diploma = (value: unknown): DiplomaLevel => { const v = String(value ?? "").toLowerCase(); return v.includes("phd") || v.includes("doctor") ? "Doctorat" : v.includes("engineer") || v.includes("ingénieur") ? "Ingénieur" : v.includes("master") ? "Master" : v.includes("bachelor") || v.includes("licence") ? "Licence (Bachelor's)" : v.includes("baccala") || v === "high school" ? "Baccalauréat" : "" }
export function prefill(student: any, record: any, folderId: string): AdmissionFormData {
  const p = student.fields, f = record?.fields ?? {}
  const language = String(p[P.language] ?? "").toLowerCase()
  return { ...initialAdmissionData, profile: { firstName: p[AIRTABLE.tables.prospects.fields.name] ?? "", lastName: p[AIRTABLE.tables.prospects.fields.surname] ?? "", email: p[AIRTABLE.tables.prospects.fields.email] ?? "", phone: p[P.phone] ?? "", programType: program(p[P.target]), folderId }, academic: { ...initialAdmissionData.academic, diplomaLevel: diploma(f[F.diplomaLevel] ?? p[P.level] ?? p[P.diploma]), fieldOfStudy: f[F.fieldOfStudy] ?? p[P.studyField] ?? "", scoreValue: f[F.scoreValue] ?? "", yearObtained: String(p[P.year] ?? ""), studyLanguage: language.includes("ital") || language === "it" ? "Italien" : language.includes("en") ? "Anglais" : "", hasGap: !!f[F.gapYears], gapYears: f[F.gapYears] ?? 0, gapDocTypes: f[F.gapDocTypes] ?? [], gapOtherDocLabel: f[F.gapDescription] ?? "" }, documents: { passport: { file: null, expiryDate: f[F.passportExpiry] ?? "" }, lang: { file: null, certName: f[F.languageCertName] ?? "" } } }
}
export function summary(record: any) {
  const documents = record?.fields?.[F.documents] ?? []
  return record ? { recordId: record.id, submittedDocIds: [...new Set(documents.map((d: any) => docIdFromFilename(d.filename)).filter(Boolean))], documents: documents.map((d: any) => ({ id: d.id, name: d.filename, url: d.url })) } : null
}
