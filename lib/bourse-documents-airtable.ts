import "server-only";
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config";
import { airtableFetch } from "@/lib/airtable-fetch";
import { findProspectByEmail } from "@/lib/airtable-prospects";
export { findProspectByEmail, createMinimalProspect } from "@/lib/airtable-prospects";

const { baseId } = AIRTABLE;
const table = AIRTABLE.tables.bourseDocuments;
const F = table.fields;

/** Airtable content upload API accepts at most 5 MB per file. */
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export type BourseUploadFieldKey =
  | "birthCertificates"
  | "familyBooklet"
  | "propertyDocs"
  | "nonPropertyDocs"
  | "balanceAttestation"
  | "taxDeclarations"
  | "otherDocuments";

export const BOURSE_UPLOAD_FIELD_IDS: Record<BourseUploadFieldKey, string> = {
  birthCertificates: F.birthCertificates,
  familyBooklet: F.familyBooklet,
  propertyDocs: F.propertyDocs,
  nonPropertyDocs: F.nonPropertyDocs,
  balanceAttestation: F.balanceAttestation,
  taxDeclarations: F.taxDeclarations,
  otherDocuments: F.otherDocuments,
};

export interface ExistingBourseSubmission {
  recordId: string;
  status: string | null;
  submissionDate: string | null;
  submittedGroupKeys: string[];
  uploadedFilesByField: Record<BourseUploadFieldKey, string[]>;
  filesByField: Partial<Record<BourseUploadFieldKey, { name: string; url: string | null }[]>>;
  unmatchedAttachmentCount: number;
}

const UPLOAD_GROUP_PREFIX = "BourseField_";

export function bourseAttachmentFilename(groupKey: string, originalName: string): string {
  return `${UPLOAD_GROUP_PREFIX}${groupKey}--${originalName}`;
}

/** Find the latest bourse dossier linked to the student's prospect and its known upload groups. */
export async function findExistingBourseSubmission(email: string): Promise<ExistingBourseSubmission | null> {
  const prospectId = await findProspectByEmail(email);
  if (!prospectId) return null;

  const attachmentFields = Object.values(BOURSE_UPLOAD_FIELD_IDS);
  let offset: string | undefined;
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${table.id}`);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("returnFieldsByFieldId", "true");
    url.searchParams.set("sort[0][field]", F.submissionDate);
    url.searchParams.set("sort[0][direction]", "desc");
    url.searchParams.append("fields[]", F.prospect);
    url.searchParams.append("fields[]", F.submissionDate);
    url.searchParams.append("fields[]", F.dossierStatus);
    for (const fieldId of attachmentFields) url.searchParams.append("fields[]", fieldId);
    if (offset) url.searchParams.set("offset", offset);

    const res = await airtableFetch(url.toString(), {
      headers: { Authorization: `Bearer ${getAirtableApiKey()}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bourse-document lookup failed (${res.status}): ${text}`);
    }

    const json = await res.json();
    const record = (json?.records ?? []).find((item: { fields?: Record<string, unknown> }) => {
      const linkedProspects = item.fields?.[F.prospect];
      return Array.isArray(linkedProspects) && linkedProspects.includes(prospectId);
    });

    if (record) {
      const submittedGroupKeys = new Set<string>();
      const uploadedFilesByField: Record<BourseUploadFieldKey, string[]> = {
        birthCertificates: [],
        familyBooklet: [],
        propertyDocs: [],
        nonPropertyDocs: [],
        balanceAttestation: [],
        taxDeclarations: [],
        otherDocuments: [],
      };
      const filesByField: ExistingBourseSubmission["filesByField"] = {};
      let unmatchedAttachmentCount = 0;
      for (const [fieldKey, fieldId] of Object.entries(BOURSE_UPLOAD_FIELD_IDS) as [BourseUploadFieldKey, string][]) {
        const attachments = record.fields?.[fieldId];
        if (!Array.isArray(attachments)) continue;
        for (const attachment of attachments as { filename?: string; url?: string }[]) {
          const filename = attachment.filename ?? "";
          (filesByField[fieldKey] ??= []).push({ name: filename.replace(/^BourseField_[a-zA-Z0-9_]+--/, ""), url: attachment.url ?? null });
          const match = filename.match(/^BourseField_([a-zA-Z0-9_]+)--/);
          if (match) submittedGroupKeys.add(match[1]);
          else unmatchedAttachmentCount += 1;
          const legacyPrefix = `BourseField_${fieldKey}__`;
          uploadedFilesByField[fieldKey].push(
            filename.startsWith(legacyPrefix)
              ? filename.slice(filename.indexOf("--") + 2)
              : filename
          );
        }
      }
      return {
        recordId: record.id as string,
        status: typeof record.fields?.[F.dossierStatus] === "string" ? record.fields[F.dossierStatus] : null,
        submissionDate: typeof record.fields?.[F.submissionDate] === "string" ? record.fields[F.submissionDate] : null,
        submittedGroupKeys: [...submittedGroupKeys],
        uploadedFilesByField,
        filesByField,
        unmatchedAttachmentCount,
      };
    }

    offset = json?.offset as string | undefined;
  } while (offset);

  return null;
}

export interface CreateBourseDocumentsRecordInput {
  householdMembersText: string;
  prospectRecordId: string | null;
}

export async function createBourseDocumentsRecord(
  input: CreateBourseDocumentsRecordInput
): Promise<string> {
  const fields: Record<string, unknown> = {
    [F.submissionDate]: new Date().toISOString().split("T")[0],
    [F.dossierStatus]: "Reçu",
  };

  if (input.householdMembersText.trim()) {
    fields[F.householdMembers] = input.householdMembersText.trim();
  }
  if (input.prospectRecordId) {
    fields[F.prospect] = [input.prospectRecordId];
  }

  const res = await airtableFetch(`https://api.airtable.com/v0/${baseId}/${table.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAirtableApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      typecast: true,
      fields,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bourse-Documents record creation failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const recordId = json?.id;
  if (!recordId) {
    throw new Error("Bourse-Documents record creation returned no record id");
  }
  return recordId;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadBourseAttachment(
  recordId: string,
  fieldKey: BourseUploadFieldKey,
  file: File,
  filename: string
): Promise<void> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `"${filename}" is ${mb} MB. Airtable only accepts files up to 5 MB — please compress it and try again.`
    );
  }

  const fieldId = BOURSE_UPLOAD_FIELD_IDS[fieldKey];
  if (!fieldId) {
    throw new Error(`Unknown upload field: ${fieldKey}`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64File = Buffer.from(arrayBuffer).toString("base64");
  const body = JSON.stringify({
    contentType: file.type || "application/octet-stream",
    filename,
    file: base64File,
  });

  const url = `https://content.airtable.com/v0/${baseId}/${recordId}/${fieldId}/uploadAttachment`;
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res: Response;
    try {
      res = await airtableFetch(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAirtableApiKey()}`,
            "Content-Type": "application/json",
          },
          body,
        },
        2
      );
    } catch (err) {
      if (attempt < maxAttempts) {
        await sleep(1500 * attempt);
        continue;
      }
      throw err;
    }

    if (res.ok) return;

    const text = await res.text();

    if (res.status === 429 && attempt < maxAttempts) {
      console.warn(
        `Airtable rate limit on "${filename}" — waiting 30s (attempt ${attempt}/${maxAttempts})`
      );
      await sleep(30_000);
      continue;
    }

    if (res.status >= 500 && attempt < maxAttempts) {
      await sleep(1500 * attempt);
      continue;
    }

    throw new Error(`Attachment upload failed (${res.status}): ${text}`);
  }
}
