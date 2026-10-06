import { NextRequest, NextResponse } from "next/server";
import { airtableNetworkErrorMessage } from "@/lib/airtable-fetch";
import {
  createBourseDocumentsRecord,
  createMinimalProspect,
  findProspectByEmail,
  findExistingBourseSubmission,
} from "@/lib/bourse-documents-airtable";

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get("email") ?? "").trim();
  if (!email) return NextResponse.json({ error: "E-mail obligatoire." }, { status: 400 });
  try {
    const existing = await findExistingBourseSubmission(email);
    return NextResponse.json(existing ? { found: true, ...existing } : { found: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: airtableNetworkErrorMessage(err) }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    householdMembersText?: string;
    existingRecordId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const householdMembersText = String(body.householdMembersText ?? "");

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "Le prénom, le nom et l'e-mail sont obligatoires." },
      { status: 400 }
    );
  }

  try {
    if (body.existingRecordId) {
      const existing = await findExistingBourseSubmission(email);
      if (!existing || existing.recordId !== body.existingRecordId) {
        return NextResponse.json({ error: "Ce dossier ne correspond pas à cette adresse e-mail." }, { status: 409 });
      }
      return NextResponse.json({ success: true, recordId: existing.recordId, prospectFound: true, prospectCreated: false, prospectLinked: true });
    }

    let prospectRecordId = await findProspectByEmail(email);
    const prospectCreated = !prospectRecordId;
    if (!prospectRecordId) {
      prospectRecordId = await createMinimalProspect({ firstName, lastName, email });
    }

    const recordId = await createBourseDocumentsRecord({
      householdMembersText,
      prospectRecordId,
    });

    return NextResponse.json({
      success: true,
      recordId,
      prospectFound: Boolean(prospectRecordId) && !prospectCreated,
      prospectCreated,
      prospectLinked: Boolean(prospectRecordId),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: airtableNetworkErrorMessage(err),
      },
      { status: 502 }
    );
  }
}
