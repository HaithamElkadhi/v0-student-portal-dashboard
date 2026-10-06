import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE } from "@/lib/airtable-config"
import { F, P, root, call, owner, dossier, existing, prefill, summary } from "@/lib/student-admission-dossier"
import { buildDocList } from "@/components/admission-dossier/buildDocList"
import { FIXED_SCORE_FORMAT, type DiplomaLevel, type GapDocType } from "@/components/admission-dossier/types"
import { createAdmissionRecord } from "@/lib/admission-airtable"
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email") ?? "", folderId = req.nextUrl.searchParams.get("folderId") ?? ""
    const student = await owner(email, folderId)
    if (!student) return NextResponse.json({ error: "Dossier étudiant introuvable." }, { status: 403 })
    const record = await existing(email, student.id)
    return NextResponse.json({ data: prefill(student, record, folderId), existing: summary(record) })
  } catch { return NextResponse.json({ error: "Impossible de charger votre dossier." }, { status: 502 }) }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(), profile = body.profile ?? {}, academic = body.academic ?? {}
    const student = await owner(String(profile.email ?? ""), String(body.folderId ?? ""))
    if (!student) return NextResponse.json({ error: "Dossier étudiant introuvable." }, { status: 403 })
    const levels = ["", "Baccalauréat", "Licence (Bachelor's)", "Master", "Ingénieur", "Doctorat", "PhD"]
    const gapTypes = ["Internship / Stage", "Work certificate", "Training / Formation", "Other document", "No document"]
    if (!levels.includes(academic.diplomaLevel ?? "") || !Array.isArray(academic.gapDocTypes ?? []) || (academic.gapDocTypes ?? []).some((v: string) => !gapTypes.includes(v)) || !profile.firstName?.trim() || !profile.lastName?.trim() || [profile.firstName, profile.lastName, profile.phone, academic.fieldOfStudy, academic.scoreValue, academic.gapDescription].some(v => String(v ?? "").length > 500)) return NextResponse.json({ error: "Informations invalides." }, { status: 400 })
    if (academic.yearObtained && !/^\d{4}$/.test(academic.yearObtained)) return NextResponse.json({ error: "Année d’obtention invalide." }, { status: 400 })
    const programMap: Record<string, string> = { "Laurea Magistrale (Master's)": "master", "Laurea Triennale (Bachelor's)": "bachelor", "Dottorato (PhD)": "phd" }
    if (profile.programType && !programMap[profile.programType]) return NextResponse.json({ error: "Diplôme visé invalide." }, { status: 400 })
    const docList = buildDocList(academic.diplomaLevel as DiplomaLevel, false, (academic.gapDocTypes ?? []) as GapDocType[], academic.gapDescription ?? "", academic.studyLanguage ?? "")
    const metadata = { [F.diplomaLevel]: academic.diplomaLevel || null, [F.fieldOfStudy]: academic.fieldOfStudy ?? "", [F.scoreFormat]: FIXED_SCORE_FORMAT, [F.scoreValue]: academic.scoreValue ?? "", [F.gapDescription]: academic.gapDescription ?? "", [F.gapDocTypes]: academic.gapDocTypes ?? [], [F.passportExpiry]: body.passportExpiry || null, [F.languageCertName]: body.languageCertName ?? "", [F.totalExpected]: docList.length }
    let recordId: string
    if (body.recordId) {
      const record = await dossier(String(body.recordId), student.id)
      if (!record) return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
      await call(`${root}/${AIRTABLE.tables.documents.id}/${record.id}`, { method: "PATCH", body: JSON.stringify({ typecast: true, fields: metadata }) })
      recordId = record.id
    } else {
      recordId = await createAdmissionRecord({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, diplomaLevel: academic.diplomaLevel ?? "", fieldOfStudy: academic.fieldOfStudy ?? "", scoreFormat: FIXED_SCORE_FORMAT, scoreValue: academic.scoreValue ?? "", gapYears: Number(academic.gapYears) || 0, gapDescription: academic.gapDescription ?? "", gapDocTypes: academic.gapDocTypes ?? [], passportExpiry: body.passportExpiry || null, languageCertName: body.languageCertName ?? "", totalDocsExpected: docList.length, totalDocsUploaded: 0, prospectRecordId: student.id })
    }
    // Profile fields already exist in Prospects; keep the dossier creation independent from optional profile sync.
    const profileFields: Record<string, unknown> = { [P.phone]: String(profile.phone ?? "") }
    if (profile.programType) profileFields[P.target] = programMap[profile.programType]
    if (academic.yearObtained) profileFields[P.year] = Number(academic.yearObtained)
    try { await call(`${root}/${AIRTABLE.tables.prospects.id}/${student.id}`, { method: "PATCH", body: JSON.stringify({ fields: profileFields }) }) } catch { console.error("Admission profile sync failed") }
    return NextResponse.json({ success: true, recordId, prospectFound: true, totalDocsExpected: docList.length })
  } catch { return NextResponse.json({ error: "Impossible d’enregistrer votre dossier. Réessayez." }, { status: 502 }) }
}
