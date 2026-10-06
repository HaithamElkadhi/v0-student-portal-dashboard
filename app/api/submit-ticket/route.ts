import { NextRequest, NextResponse } from "next/server";
import {
  createSupportTicket,
  getTicketCategories,
  MAX_TICKET_ATTACHMENT_BYTES,
  uploadTicketAttachment,
} from "@/lib/ticket-airtable";

const MAX_ATTACHMENTS_PER_TICKET = 5;
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
]);

function isAllowedAttachment(file: File): boolean {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ALLOWED_ATTACHMENT_EXTENSIONS.has(extension);
}

export async function POST(req: NextRequest) {
  let fullName = "";
  let email = "";
  let phone = "";
  let subject = "";
  let description = "";
  let attachments: File[] = [];

  try {
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const value = (key: string) => String(formData.get(key) ?? "").trim();
      fullName = value("fullName");
      email = value("email");
      phone = value("phone");
      subject = value("subject");
      description = value("description");
      const entries = formData.getAll("attachments");
      if (entries.some((entry) => !(entry instanceof File))) {
        return NextResponse.json({ error: "Invalid attachment." }, { status: 400 });
      }
      attachments = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
    } else {
      const body = (await req.json()) as {
        fullName?: string;
        email?: string;
        phone?: string;
        subject?: string;
        description?: string;
      };
      fullName = String(body.fullName ?? "").trim();
      email = String(body.email ?? "").trim();
      phone = String(body.phone ?? "").trim();
      subject = String(body.subject ?? "").trim();
      description = String(body.description ?? "").trim();
    }
  } catch {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
  }

  if (!fullName || !email || !phone || !subject || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (attachments.length > MAX_ATTACHMENTS_PER_TICKET) {
    return NextResponse.json(
      { error: `Attach up to ${MAX_ATTACHMENTS_PER_TICKET} files.` },
      { status: 400 }
    );
  }

  for (const file of attachments) {
    if (!isAllowedAttachment(file)) {
      return NextResponse.json(
        { error: `"${file.name}" has an unsupported format. Use PDF, JPG, PNG, DOC, or DOCX.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_TICKET_ATTACHMENT_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" exceeds the 5 MB limit.` },
        { status: 400 }
      );
    }
  }

  let allowed: string[];
  try {
    allowed = await getTicketCategories();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not validate category against Airtable." },
      { status: 502 }
    );
  }

  if (!allowed.includes(subject)) {
    return NextResponse.json({ error: "Invalid request subject" }, { status: 400 });
  }

  try {
    const result = await createSupportTicket({
      fullName,
      email,
      phone,
      subject,
      description,
    });

    let attachmentsUploaded = 0;
    let attachmentError: string | null = null;
    for (const file of attachments) {
      try {
        await uploadTicketAttachment(result.recordId, file);
        attachmentsUploaded += 1;
      } catch (err) {
        console.error("[submit-ticket] attachment upload failed:", err);
        attachmentError =
          "Your ticket was created, but one or more attachments could not be uploaded. Please contact our team and mention your ticket reference.";
        break;
      }
    }

    return NextResponse.json({
      ok: true,
      recordId: result.recordId,
      ticketRef: result.ticketRef,
      linkedProspect: result.linkedProspect,
      attachmentsUploaded,
      attachmentError,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not submit your ticket. Please try again." },
      { status: 502 }
    );
  }
}
