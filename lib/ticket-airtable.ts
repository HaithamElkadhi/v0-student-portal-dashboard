import "server-only";
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config";
import { airtableFetch } from "@/lib/airtable-fetch";
import { findProspectByEmail } from "@/lib/airtable-prospects";

const { baseId } = AIRTABLE;
const tasks = AIRTABLE.tables.tasks;
const F = tasks.fields;

export interface CreateTicketInput {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
}

export interface CreateTicketResult {
  recordId: string;
  ticketRef: string | null;
  linkedProspect: boolean;
}

export const MAX_TICKET_ATTACHMENT_BYTES = 5 * 1024 * 1024;

/** Live Task Type choices from Airtable schema (not hardcoded). */
export async function getTicketCategories(): Promise<string[]> {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    headers: { Authorization: `Bearer ${getAirtableApiKey()}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable schema fetch failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    tables?: Array<{
      id: string;
      fields?: Array<{
        id: string;
        type?: string;
        options?: { choices?: Array<{ name?: string }> };
      }>;
    }>;
  };

  const table = json.tables?.find((t) => t.id === tasks.id);
  if (!table) {
    throw new Error("Tasks table not found in Airtable schema");
  }

  const field = table.fields?.find((f) => f.id === F.taskType);
  if (!field) {
    throw new Error("Task Type field not found in Airtable schema");
  }

  const choices = (field.options?.choices ?? [])
    .map((c) => c.name?.trim() ?? "")
    .filter(Boolean);

  if (choices.length === 0) {
    throw new Error("Task Type field has no choices in Airtable");
  }

  return choices;
}

export async function createSupportTicket(
  input: CreateTicketInput
): Promise<CreateTicketResult> {
  const prospectRecordId = await findProspectByEmail(input.email);

  const fields: Record<string, unknown> = {
    [F.prospectName]: input.fullName,
    [F.clientEmail]: input.email,
    [F.clientPhone]: input.phone,
    [F.ticketType]: "Ticket",
    [F.taskObject]: input.subject,
    [F.description]: input.description,
    [F.taskStatus]: "Todo",
  };

  if (prospectRecordId) {
    fields[F.linkedProspect] = [prospectRecordId];
  }

  const res = await airtableFetch(`https://api.airtable.com/v0/${baseId}/${tasks.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAirtableApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      typecast: true,
      fields,
      returnFieldsByFieldId: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Task creation failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const recordId: string | undefined = json?.id;
  if (!recordId) {
    throw new Error("Task creation returned no record id");
  }

  let ticketRef = readTicketRef(json?.fields);

  // Formula fields are sometimes empty on create — fetch once if needed.
  if (!ticketRef) {
    ticketRef = await fetchTicketRef(recordId);
  }

  return {
    recordId,
    ticketRef,
    linkedProspect: Boolean(prospectRecordId),
  };
}

/** Upload one file to the Tasks table's Attachment field without replacing existing files. */
export async function uploadTicketAttachment(recordId: string, file: File): Promise<void> {
  if (file.size > MAX_TICKET_ATTACHMENT_BYTES) {
    throw new Error(`"${file.name}" exceeds the 5 MB attachment limit.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64File = Buffer.from(arrayBuffer).toString("base64");
  const fieldId = F.attachment;
  const res = await airtableFetch(
    `https://content.airtable.com/v0/${baseId}/${recordId}/${fieldId}/uploadAttachment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAirtableApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: file.type || "application/octet-stream",
        filename: file.name,
        file: base64File,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable attachment upload failed (${res.status}): ${text}`);
  }
}

function readTicketRef(fields: Record<string, unknown> | undefined): string | null {
  if (!fields) return null;
  const byId = fields[F.ticketRef];
  if (typeof byId === "string" && byId.trim()) return byId.trim();
  return null;
}

async function fetchTicketRef(recordId: string): Promise<string | null> {
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${tasks.id}/${recordId}`);
  url.searchParams.set("returnFieldsByFieldId", "true");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getAirtableApiKey()}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ticket ref fetch failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return readTicketRef(json?.fields);
}
