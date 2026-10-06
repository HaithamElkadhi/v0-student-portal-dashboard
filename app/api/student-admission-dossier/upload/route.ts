import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE } from "@/lib/airtable-config"
import { owner, dossier, F, root, call, summary } from "@/lib/student-admission-dossier"
import { renameFile, uploadAdmissionAttachment } from "@/lib/admission-airtable"
import { buildDocList } from "@/components/admission-dossier/buildDocList"
const allowed = new Set(buildDocList("Doctorat", false, ["Internship / Stage", "Work certificate", "Training / Formation", "Other document"]).map(d => d.id))
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData(), file = form.get("file"), docId = String(form.get("docId") ?? "")
    if (!allowed.has(docId) || !(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name)) return NextResponse.json({ error: "Choisissez un PDF, JPG ou PNG de 5 Mo maximum." }, { status: 400 })
    const student = await owner(String(form.get("email") ?? ""), String(form.get("folderId") ?? ""))
    if (!student) return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
    const record = await dossier(String(form.get("recordId") ?? ""), student.id)
    if (!record) return NextResponse.json({ error: "Ce dossier ne vous appartient pas." }, { status: 403 })
    const filename = renameFile(docId, student.fields[AIRTABLE.tables.prospects.fields.surname] ?? "", student.fields[AIRTABLE.tables.prospects.fields.name] ?? "", file.name, String(form.get("certName") ?? ""))
    await uploadAdmissionAttachment(record.id, file, filename)
    // Refresh the count only after the attachment has been successfully accepted.
    try {
      const updated = await dossier(record.id, student.id)
      const count = summary(updated)?.submittedDocIds.length ?? 0
      await call(`${root}/${AIRTABLE.tables.documents.id}/${record.id}`, { method: "PATCH", body: JSON.stringify({ fields: { [F.submittedCount]: count } }) })
    } catch { console.error("Admission document count refresh failed") }
    return NextResponse.json({ success: true, filename })
  } catch { return NextResponse.json({ error: "Le document n’a pas pu être envoyé. Réessayez." }, { status: 502 }) }
}
