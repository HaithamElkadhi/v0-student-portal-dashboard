import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config";
import { findProspectByEmail } from "@/lib/airtable-prospects";
import { NextRequest, NextResponse } from "next/server";
import { airtableNetworkErrorMessage } from "@/lib/airtable-fetch";
import {
  BOURSE_UPLOAD_FIELD_IDS,
  MAX_ATTACHMENT_BYTES,
  bourseAttachmentFilename,
  uploadBourseAttachment,
  type BourseUploadFieldKey,
} from "@/lib/bourse-documents-airtable";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
  }

  const email = String(formData.get("email") ?? "").trim();
  const recordId = String(formData.get("recordId") ?? "").trim();
  const fieldKey = String(formData.get("fieldKey") ?? "").trim() as BourseUploadFieldKey;
  const groupKey = String(formData.get("groupKey") ?? "").trim();
  const file = formData.get("file");

  if (
    !email ||
    !/^rec[a-zA-Z0-9]+$/.test(recordId) ||
    !recordId ||
    !fieldKey ||
    !(fieldKey in BOURSE_UPLOAD_FIELD_IDS) ||
    !groupKey.startsWith(`${fieldKey}__`) ||
    !/^[a-zA-Z0-9_]+$/.test(groupKey) ||
    !(file instanceof File) ||
    file.size === 0
  ) {
    return NextResponse.json({ error: "Missing required upload fields" }, { status: 400 });
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      {
        success: false,
        error: `"${file.name}" is ${mb} MB. Airtable only accepts files up to 5 MB — please compress it and try again.`,
      },
      { status: 400 }
    );
  }

  const filename = bourseAttachmentFilename(groupKey, file.name);

  try {
    const prospectId = await findProspectByEmail(email);
    const recordResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE.baseId}/${AIRTABLE.tables.bourseDocuments.id}/${recordId}?returnFieldsByFieldId=true`,
      { headers: { Authorization: `Bearer ${getAirtableApiKey()}` }, cache: "no-store" }
    );
    if (!recordResponse.ok) throw new Error("Impossible de vérifier le dossier.");
    const record = await recordResponse.json();
    const linked = record.fields?.[AIRTABLE.tables.bourseDocuments.fields.prospect];
    if (!prospectId || !Array.isArray(linked) || !linked.includes(prospectId)) {
      return NextResponse.json({ error: "Ce dossier ne correspond pas à cette adresse e-mail." }, { status: 403 });
    }
    await uploadBourseAttachment(recordId, fieldKey, file, filename);
    return NextResponse.json({ success: true, filename });
  } catch (err) {
    console.error(err);
    const message = airtableNetworkErrorMessage(err);
    const status = message.includes("5 MB") ? 400 : 502;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
