export type Attachment = { id: string; filename: string; url: string }
export type DocumentRecord = { id: string; fields: Record<string, unknown> }
export type StudentDocumentItem = {
  key: string; name: string; group: "original" | "final"; status: string; requirement: string
  reason: string; due: string; updatedAt: string; files: Attachment[]; reviewId: string
  sourceRecordId: string; sourceField: string; attachmentId: string
}
export function attachments(value: unknown): Attachment[] {
  if (!Array.isArray(value)) return []
  return value.filter((file): file is Attachment => file && typeof file.id === "string" && typeof file.filename === "string" && typeof file.url === "string" && /^https:\/\//i.test(file.url)).map(({ id, filename, url }) => ({ id, filename, url }))
}
const string = (value: unknown) => typeof value === "string" ? value : ""
export function studentDocumentItems(student: DocumentRecord, folders: DocumentRecord[], reviews: DocumentRecord[]): StudentDocumentItem[] {
  const academicReviews = reviews.filter(r => r.fields["Student Record ID"] === student.id && r.fields.Source === "Academic")
  const items: StudentDocumentItem[] = []
  function add(key: string, recordId: string, field: string, file?: Attachment, review?: DocumentRecord) {
    const f = review?.fields || {}
    items.push({ key, name: string(f["Document Name"]) || file?.filename || "Document demandé", group: field === "Documents admission originaux" ? "original" : "final", status: string(f["Review Status"]) || (file ? "Received" : "Missing"), requirement: string(f.Requirement) || "Required", reason: string(f["Correction Reason"]), due: string(f["Due Date"]), updatedAt: string(f["Updated At"]), files: [...attachments(f.Versions).reverse(), ...(file ? [file] : [])], reviewId: review?.id || "", sourceRecordId: recordId, sourceField: field, attachmentId: file?.id || string(f["Attachment ID"]) })
  }
  for (const record of [student, ...folders]) {
    if (record.id !== student.id && !(Array.isArray(record.fields.Prospect) && record.fields.Prospect.includes(student.id))) continue
    for (const field of record.id === student.id ? ["Documents admission originaux"] : ["Documents", "Documents admission originaux"]) {
      for (const file of attachments(record.fields[field])) {
        const key = `Academic:${record.id}:${field}:${file.id}`
        add(key, record.id, field, file, academicReviews.find(r => r.fields["Document Key"] === key))
      }
    }
  }
  for (const review of academicReviews) {
    const key = string(review.fields["Document Key"])
    if (key && !items.some(item => item.key === key)) add(key, string(review.fields["Source Record ID"]), string(review.fields["Source Field"]), undefined, review)
  }
  return items
}
