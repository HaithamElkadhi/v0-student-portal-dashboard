import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

export async function GET(request: NextRequest) {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: "Missing Airtable environment variables" },
        { status: 500 }
      )
    }

    // Fetch the base schema
    const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Airtable API error:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch schema", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      tables: data.tables,
    })
  } catch (error) {
    console.error("Schema fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching schema", details: String(error) },
      { status: 500 }
    )
  }
}
