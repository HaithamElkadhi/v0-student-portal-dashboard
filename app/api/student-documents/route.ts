import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { documentSession } from "@/lib/student-document-session"
import { loadStudentDocuments, loadRequiredDocuments, documentRequest, reviewTable } from "@/lib/student-document-store"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"

const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } })
function identity(request: NextRequest) {
  const session = documentSession(request)
  return session && request.nextUrl.searchParams.get("folderId") === session.folderId ? session : null
}
export async function GET(request: NextRequest) {
  const session = identity(request)
  if (!session) return json({ error: "Veuillez vérifier votre connexion." }, 401)
  const [documents, requirements] = await Promise.allSettled([loadStudentDocuments(session.id), loadRequiredDocuments(session.id)])
  return json({
    documents: documents.status === "fulfilled" ? documents.value.map(doc => ({ key: doc.key, name: doc.name, status: doc.status, file: doc.files[0] || null })) : null,
    requirements: requirements.status === "fulfilled" ? requirements.value : null,
    documentsError: documents.status === "rejected" ? "Impossible de charger vos documents. Réessayez." : "",
    requirementsError: requirements.status === "rejected" ? "Impossible de charger la liste des documents requis. Réessayez ou contactez votre conseiller." : "",
  })
}
export async function POST(request: NextRequest) {
  const session = identity(request)
  if (!session) return json({ error: "Veuillez vérifier votre connexion." }, 401)
  if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Origine non autorisée." }, 403)
  let uploaded = false
  try {
    const form = await request.formData(), file = form.get("file")
    const name = String(form.get("name") || "").trim(), uploadId = String(form.get("uploadId") || "")
    if (!name || name.length > 150 || !/^[a-f0-9-]{36}$/i.test(uploadId)) return json({ error: "Donnez un nom à votre document (150 caractères maximum)." }, 400)
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name)) return json({ error: "PDF, JPG ou PNG de 5 Mo maximum." }, 400)
    const key = `portal:${session.id}:${uploadId}`
    const previous = (await loadStudentDocuments(session.id)).find(doc => doc.key === key)
    if (previous && previous.name !== name) return json({ error: "Actualisez avant de déposer un autre document." }, 409)
    if (previous?.files.length) {
      if (previous.status === "Missing") await documentRequest(reviewTable + "/" + previous.reviewId, { method: "PATCH", body: JSON.stringify({ fields: { "Review Status": "Received", "Updated At": new Date().toISOString(), "Updated By": "Student portal" } }) })
      return json({ success: true })
    }
    const review = previous?.reviewId ? { id: previous.reviewId } : await documentRequest(reviewTable, { method: "POST", body: JSON.stringify({ fields: { "Document Key": key, "Student Record ID": session.id, Source: "Academic", "Document Name": name, Requirement: "Optional", "Review Status": "Missing", "Updated At": new Date().toISOString(), "Updated By": "Student portal" } }) })
    const response = await fetch(`https://content.airtable.com/v0/${AIRTABLE.baseId}/${review.id}/fld2rhsPGgwmmUEo1/uploadAttachment`, { method: "POST", headers: { Authorization: `Bearer ${getAirtableApiKey()}`, "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type, file: Buffer.from(await file.arrayBuffer()).toString("base64") }), signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw new Error("Upload failed")
    uploaded = true
    await documentRequest(reviewTable + "/" + review.id, { method: "PATCH", body: JSON.stringify({ fields: { "Review Status": "Received", "Updated At": new Date().toISOString(), "Updated By": "Student portal" } }) })
    try {
      await documentRequest("tblRmPz47Tclxz3od", { method: "POST", body: JSON.stringify({ fields: { "Event ID": randomUUID(), "Student Record ID": session.id, "Document Key": key, Action: "Uploaded", "Occurred At": new Date().toISOString(), Actor: "Student portal", Details: "Student uploaded: " + name, Result: "Applied" } }) })
    } catch { /* The uploaded file remains available even if activity logging is unavailable. */ }
    return json({ success: true })
  } catch { return json({ error: uploaded ? "Fichier reçu, mais confirmation incomplète. Actualisez vos documents avant de réessayer." : "Envoi non confirmé. Réessayez avec le même document.", refreshRequired: true }, 502) }
}
