import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID

export async function POST(request: NextRequest) {
  try {
    const { folderId, email } = await request.json()

    if (!folderId && !email) {
      return NextResponse.json({ error: "folderId or email required" }, { status: 400 })
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Look up the record
    let filterFormula = ""
    if (folderId && email) {
      filterFormula = `OR({Email} = "${email}", {Prospect ID} = "${folderId}")`
    } else if (folderId) {
      filterFormula = `{Prospect ID} = "${folderId}"`
    } else {
      filterFormula = `{Email} = "${email}"`
    }

    const encodedTable = encodeURIComponent(AIRTABLE_TABLE_ID)
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedTable}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    })

    if (!searchRes.ok) {
      return NextResponse.json({ error: "Failed to find student record" }, { status: 500 })
    }

    const searchData = await searchRes.json()
    if (!searchData.records || searchData.records.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const recordId = searchData.records[0].id

    // Patch Contrat_Signed = true
    const patchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedTable}/${recordId}`
    const patchRes = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: { Contrat_Signed: true } }),
    })

    if (!patchRes.ok) {
      const err = await patchRes.text()
      console.error("Airtable PATCH error:", err)
      return NextResponse.json({ error: "Failed to update contract status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("sign-contract error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
