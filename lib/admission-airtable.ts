import "server-only";
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config";
import { airtableFetch } from "@/lib/airtable-fetch";
export { findProspectByEmail } from "@/lib/airtable-prospects";

const { baseId } = AIRTABLE;
const documents = AIRTABLE.tables.documents;
const F = documents.fields;

/** Airtable content upload API accepts at most 5 MB per file. */
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const DOC_LABELS: Record<string, string> = {
  photo: "PassportPhoto",
  passport: "Passport",
  cv: "CV",
  lang: "LanguageCert",
  ddv: "DeclarationDeValeur",
  bac_dip: "BacDiploma",
  bac_tr: "BacTranscript",
  lic_dip: "LicenceDiploma",
  lic_tr1: "LicenceTranscriptY1",
  lic_tr2: "LicenceTranscriptY2",
  lic_tr3: "LicenceTranscriptY3",
  mas_dip: "MasterDiploma",
  mas_tr1: "MasterTranscriptY1",
  mas_tr2: "MasterTranscriptY2",
  phd_dip: "PhDDiploma",
  gap_stage: "GapDoc_Stage",
  gap_work: "GapDoc_Work",
  gap_training: "GapDoc_Training",
  gap_other: "GapDoc_Other",
  rec_1: "Recommendation1", rec_2: "Recommendation2",
  plan_licence: "StudyPlanLicence", plan_master: "StudyPlanMaster", plan_doctorat: "StudyPlanDoctorat",
};

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatLastName(lastName: string): string {
  return stripAccents(lastName.trim())
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "");
}

function formatFirstName(firstName: string): string {
  const cleaned = stripAccents(firstName.trim()).replace(/[^A-Za-z0-9 -]/g, "");
  if (!cleaned) return "";
  const lower = cleaned.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function sanitizeExtraLabel(label: string): string {
  return stripAccents(label.trim())
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-_]/g, "");
}

export function renameFile(
  docId: string,
  studentLastName: string,
  studentFirstName: string,
  originalFilename: string,
  extraLabel?: string
): string {
  const ext = originalFilename.includes(".")
    ? originalFilename.slice(originalFilename.lastIndexOf("."))
    : "";
  const last = formatLastName(studentLastName) || "STUDENT";
  const first = formatFirstName(studentFirstName) || "Student";
  const label = DOC_LABELS[docId] ?? docId;

  let base = `${last}_${first}_${label}`;
  if (docId === "lang" && extraLabel?.trim()) {
    const extra = sanitizeExtraLabel(extraLabel);
    if (extra) base += `_${extra}`;
  }

  return `${base}${ext}`;
}

export interface CreateAdmissionRecordInput {
  firstName: string;
  lastName: string;
  email: string;
  diplomaLevel: string;
  fieldOfStudy: string;
  scoreFormat: string;
  scoreValue: string;
  gapYears: number;
  gapDescription: string;
  gapDocTypes: string[];
  passportExpiry: string | null;
  languageCertName: string;
  totalDocsExpected: number;
  totalDocsUploaded: number;
  prospectRecordId: string | null;
}

export async function createAdmissionRecord(
  input: CreateAdmissionRecordInput
): Promise<string> {
  const gapDocTypes = input.gapDocTypes.filter((t) => t && t !== "No document");

  const fields: Record<string, unknown> = {
    [F.name]: `${input.lastName.toUpperCase()}_${input.firstName}`,
    [F.email]: input.email,
    [F.submissionDate]: new Date().toISOString().split("T")[0],
    [F.documentsStatus]: "Pending",
    [F.dossierSubmitted]: true,
    [F.totalExpected]: input.totalDocsExpected,
    [F.submittedCount]: input.totalDocsUploaded,
  };

  if (input.diplomaLevel) fields[F.diplomaLevel] = input.diplomaLevel;
  if (input.fieldOfStudy) fields[F.fieldOfStudy] = input.fieldOfStudy;
  if (input.scoreFormat) fields[F.scoreFormat] = input.scoreFormat;
  if (input.scoreValue) fields[F.scoreValue] = input.scoreValue;
  if (Number.isFinite(input.gapYears)) fields[F.gapYears] = input.gapYears;
  if (input.gapDescription) fields[F.gapDescription] = input.gapDescription;
  if (gapDocTypes.length > 0) fields[F.gapDocTypes] = gapDocTypes;
  if (input.passportExpiry) fields[F.passportExpiry] = input.passportExpiry;
  if (input.languageCertName) fields[F.languageCertName] = input.languageCertName;
  if (input.prospectRecordId) fields[F.prospect] = [input.prospectRecordId];

  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${documents.id}`, {
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
    throw new Error(`Documents record creation failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const recordId = json?.id;
  if (!recordId) {
    throw new Error("Documents record creation returned no record id");
  }
  return recordId;
}

// ── Reverse-map attachment filenames → docIds ────────────────────────────────
// Sorted longest-label-first so "GapDoc_Stage" matches before a hypothetical
// shorter prefix would.
const LABEL_TO_DOC_ID: Array<[label: string, docId: string]> = Object.entries(DOC_LABELS)
  .map(([docId, label]) => [label.toLowerCase(), docId] as [string, string])
  .sort((a, b) => b[0].length - a[0].length);

/** Infer which docId produced a given attachment filename, or null if unknown. */
export function docIdFromFilename(filename: string): string | null {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "").toLowerCase();
  for (const [label, docId] of LABEL_TO_DOC_ID) {
    const idx = nameWithoutExt.indexOf(`_${label}`);
    if (idx === -1) continue;
    // Make sure the label is at a real boundary (end or followed by _)
    const charAfter = nameWithoutExt[idx + label.length + 1];
    if (charAfter === undefined || charAfter === "_") {
      return docId;
    }
  }
  return null;
}

export interface ExistingSubmission {
  recordId: string;
  submittedDocIds: string[];
}

/**
 * Search the Documents table for the most recent submission with this email.
 * Returns null if no match found.
 */
export async function findExistingSubmission(
  email: string
): Promise<ExistingSubmission | null> {
  function escapeValue(v: string) { return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }
  const formula = `LOWER({Email})=LOWER("${escapeValue(email.trim())}")`;

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${documents.id}`);
  url.searchParams.set("filterByFormula", formula);
  url.searchParams.set("maxRecords", "1");
  // Return field values keyed by field ID so record.fields[F.xxx] works
  url.searchParams.set("returnFieldsByFieldId", "true");
  // Most recent first — use field ID since returnFieldsByFieldId is set
  url.searchParams.set("sort[0][field]", F.submissionDate);
  url.searchParams.set("sort[0][direction]", "desc");
  // Only fetch the attachments field + email (saves bandwidth)
  // Must use .append() — .set() replaces, so only the last value would be sent
  url.searchParams.append("fields[]", F.documents);
  url.searchParams.append("fields[]", F.email);

  const res = await airtableFetch(url.toString(), {
    headers: { Authorization: `Bearer ${getAirtableApiKey()}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Existing-submission lookup failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const record = json?.records?.[0];
  if (!record) return null;

  const attachments: Array<{ filename: string }> =
    record.fields?.[F.documents] ?? [];

  const submittedDocIds = [
    ...new Set(
      attachments
        .map((a) => docIdFromFilename(a.filename))
        .filter((id): id is string => id !== null)
    ),
  ];

  return { recordId: record.id as string, submittedDocIds };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadAdmissionAttachment(
  recordId: string,
  file: File,
  filename: string
): Promise<void> {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Le fichier « ${filename} » fait ${mb} Mo. La limite est de 5 Mo — compressez-le et réessayez.`
    );
  }

  let base64File: string;
  try {
    const arrayBuffer = await file.arrayBuffer();
    base64File = Buffer.from(arrayBuffer).toString("base64");
  } catch {
    throw new Error(
      `Impossible de lire le fichier « ${filename} ». Resélectionnez-le et réessayez.`
    );
  }

  const body = JSON.stringify({
    contentType: file.type || "application/octet-stream",
    filename,
    file: base64File,
  });

  // content.airtable.com is the attachment host; api.airtable.com also accepts this path.
  const url = `https://content.airtable.com/v0/${baseId}/${recordId}/${F.documents}/uploadAttachment`;
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAirtableApiKey()}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (res.ok) return;

    const text = await res.text();

    // Airtable requires waiting ~30s after a 429 before retrying.
    if (res.status === 429 && attempt < maxAttempts) {
      console.warn(`Airtable rate limit on "${filename}" — waiting 30s (attempt ${attempt}/${maxAttempts})`);
      await sleep(30_000);
      continue;
    }

    if (res.status >= 500 && attempt < maxAttempts) {
      await sleep(1500 * attempt);
      continue;
    }

    // Translate HTTP errors to French user messages
    if (res.status === 429) {
      throw new Error(
        `Le serveur de stockage est temporairement saturé lors de l'envoi de « ${filename} ». ` +
        `Attendez 30 secondes et réessayez.`
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Erreur d'autorisation (${res.status}) lors de l'envoi de « ${filename} ». ` +
        `Rechargez la page et réessayez. Si le problème persiste, contactez-nous sur WhatsApp.`
      );
    }
    if (res.status === 400) {
      throw new Error(
        `Le fichier « ${filename} » n'a pas été accepté (format ou contenu invalide). ` +
        `Vérifiez que le fichier n'est pas corrompu et réessayez.`
      );
    }
    if (res.status >= 500) {
      throw new Error(
        `Le serveur de stockage est temporairement indisponible (${res.status}) — réessayez dans quelques secondes. ` +
        `Si le problème persiste, contactez-nous sur WhatsApp.`
      );
    }
    console.error(`[uploadAdmissionAttachment] ${res.status}: ${text}`);
    throw new Error(
      `Échec inattendu lors de l'envoi de « ${filename} » (code ${res.status}). ` +
      `Réessayez ou contactez-nous sur WhatsApp.`
    );
  }
}
