import "server-only"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { studentDocumentItems, type DocumentRecord } from "@/lib/student-document-items"
import { requiredDocuments } from "@/lib/student-document-requirements"

export const reviewTable = "tblBEikU5IsBAwzZL"
export async function loadRequiredDocuments(id: string) {
  const params = new URLSearchParams({ returnFieldsByFieldId: "true" })
  const student = await documentRequest(AIRTABLE.tables.prospects.id + "/" + id + "?" + params)
  return requiredDocuments(student.fields.fldsMJ7gvO2Qz9UzT, student.fields.fld01awcmxCsnW1GS)
}
export async function documentRequest(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE.baseId}/${path}`, { ...init, headers: { Authorization: `Bearer ${getAirtableApiKey()}`, "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error("Document storage unavailable")
  return res.json()
}
async function list(table: string, formula: string): Promise<DocumentRecord[]> {
  const records: DocumentRecord[] = []
  let offset: string | undefined
  do {
    const params = new URLSearchParams({ filterByFormula: formula, pageSize: "100" })
    if (offset) params.set("offset", offset)
    const page = await documentRequest(table + "?" + params)
    records.push(...page.records); offset = page.offset
  } while (offset)
  return records
}
export async function loadStudentDocuments(id: string) {
  const student: DocumentRecord = await documentRequest(AIRTABLE.tables.prospects.id + "/" + id)
  const ids = (Array.isArray(student.fields.Documents) ? student.fields.Documents : []).filter((value): value is string => typeof value === "string" && /^rec[a-zA-Z0-9]+$/.test(value))
  const folders: DocumentRecord[] = []
  for (let index = 0; index < ids.length; index += 50) {
    folders.push(...await list(AIRTABLE.tables.documents.id, "OR(" + ids.slice(index, index + 50).map(value => `RECORD_ID()='${value}'`).join(",") + ")"))
  }
  const reviews = await list(reviewTable, `{Student Record ID}='${id}'`)
  return studentDocumentItems(student, folders, reviews)
}
