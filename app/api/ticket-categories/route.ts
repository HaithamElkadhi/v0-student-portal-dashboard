import { NextResponse } from "next/server";
import { getTicketCategories } from "@/lib/ticket-airtable";

export async function GET() {
  try {
    const categories = await getTicketCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load categories from Airtable." },
      { status: 502 }
    );
  }
}
