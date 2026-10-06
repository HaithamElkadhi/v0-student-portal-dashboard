import "server-only";
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config";
import { airtableFetch } from "@/lib/airtable-fetch";

const { baseId } = AIRTABLE;
const prospects = AIRTABLE.tables.prospects;
const F = prospects.fields;

function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Case-insensitive email match on Prospects. Returns record id or null.
 * Formula uses the field name "Email" (more reliable than field IDs in formulas).
 */
export async function findProspectByEmail(email: string): Promise<string | null> {
  const formula = `LOWER({Email}) = LOWER("${escapeFormulaValue(email.trim())}")`;
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${prospects.id}`);
  url.searchParams.set("filterByFormula", formula);
  url.searchParams.set("maxRecords", "1");

  const res = await airtableFetch(url.toString(), {
    headers: { Authorization: `Bearer ${getAirtableApiKey()}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Prospect lookup failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json?.records?.[0]?.id ?? null;
}

/**
 * Creates a minimal Prospects row so Bourse-Documents lookups
 * (Nom / Prénom / Email) can populate when the student is new.
 */
export async function createMinimalProspect(input: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<string> {
  const res = await airtableFetch(`https://api.airtable.com/v0/${baseId}/${prospects.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAirtableApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      typecast: true,
      fields: {
        [F.name]: input.firstName.trim(),
        [F.surname]: input.lastName.trim(),
        [F.email]: input.email.trim(),
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Prospect creation failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const recordId = json?.id;
  if (!recordId) {
    throw new Error("Prospect creation returned no record id");
  }
  return recordId;
}
