import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_APPLICATIONS_TABLE_ID = process.env.AIRTABLE_APPLICATIONS_TABLE_ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prospectId } = body

    if (!prospectId) {
      return NextResponse.json(
        { error: "Prospect ID is required" },
        { status: 400 }
      )
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_APPLICATIONS_TABLE_ID) {
      console.error("Missing Airtable environment variables", {
        hasApiKey: !!AIRTABLE_API_KEY,
        hasBaseId: !!AIRTABLE_BASE_ID,
        hasApplicationsTableId: !!AIRTABLE_APPLICATIONS_TABLE_ID,
      })
      return NextResponse.json(
        { error: "Server configuration error: Missing environment variables" },
        { status: 500 }
      )
    }

    // First, try to get the schema to verify table exists and get the correct table ID
    let actualTableId = AIRTABLE_APPLICATIONS_TABLE_ID
    try {
      const schemaUrl = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`
      const schemaResponse = await fetch(schemaUrl, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      })
      
      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json()
        // Try to find the table by name (case-insensitive) or ID
        const applicationsTable = schemaData.tables?.find(
          (table: any) => 
            table.name?.toLowerCase() === AIRTABLE_APPLICATIONS_TABLE_ID?.toLowerCase() || 
            table.id === AIRTABLE_APPLICATIONS_TABLE_ID ||
            table.name === AIRTABLE_APPLICATIONS_TABLE_ID
        )
        
        if (applicationsTable) {
          actualTableId = applicationsTable.id // Use the actual table ID
          console.log("Found Applications table:", {
            name: applicationsTable.name,
            id: applicationsTable.id,
            using: actualTableId
          })
        } else {
          console.error("Applications table not found. Available tables:", 
            schemaData.tables?.map((t: any) => ({ name: t.name, id: t.id }))
          )
          // Return empty result if table doesn't exist
          return NextResponse.json({
            success: true,
            applications: [],
            message: `Table "${AIRTABLE_APPLICATIONS_TABLE_ID}" not found in base. Please create it or check the table name.`
          })
        }
      }
    } catch (schemaError) {
      console.error("Error fetching schema (will try direct query):", schemaError)
      // Continue with the original table ID/name
    }

    // Query Airtable - filter by Prospect ID
    // Use table ID if we found it, otherwise use the name
    const encodedTableId = encodeURIComponent(actualTableId)
    const filterFormula = `{Prospect ID} = "${prospectId}"`
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedTableId}?filterByFormula=${encodeURIComponent(filterFormula)}`
    
    console.log("Querying Applications from Airtable:", {
      baseId: AIRTABLE_BASE_ID,
      originalTableId: AIRTABLE_APPLICATIONS_TABLE_ID,
      actualTableId: actualTableId,
      prospectId,
      filterFormula,
      url: url.replace(AIRTABLE_API_KEY || "", "***"),
    })
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      let errorMessage = "Failed to fetch applications"
      
      try {
        const errorJson = JSON.parse(errorData)
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage
      } catch {
        errorMessage = errorData || errorMessage
      }
      
      console.error("Airtable API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      })
      
      return NextResponse.json(
        { 
          error: errorMessage || "Failed to fetch applications",
          details: response.status === 403 ? "Access forbidden. Please check your API key permissions." : undefined
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Helper function to get field value with multiple name variations
    const getFieldValue = (record: any, fieldNames: string[]): string => {
      for (const name of fieldNames) {
        if (record[name]) return String(record[name])
        // Case-insensitive search
        const foundKey = Object.keys(record).find(
          key => key.toLowerCase() === name.toLowerCase()
        )
        if (foundKey) return String(record[foundKey])
      }
      return ""
    }

    // Map Airtable records to application format
    const applications = (data.records || []).map((record: any) => {
      const fields = record.fields

      return {
        university: getFieldValue(fields, ["University", "university", "Università", "Universita"]),
        course: getFieldValue(fields, ["Course", "course", "Corso"]),
        courseLanguage: getFieldValue(fields, ["Course Language", "course language", "Course language", "Lingua del corso", "Language"]),
        degreeLevel: getFieldValue(fields, ["Degree Level", "degree level", "Degree level", "Livello di laurea", "Level"]),
        campusCity: getFieldValue(fields, ["Campus City", "campus city", "Campus city", "Città del campus", "City"]),
        dateOfCandidacy: getFieldValue(fields, ["Date of Candidacy", "date of candidacy", "Date of candidacy", "Data di candidatura", "Date"]),
        applicationStatus: getFieldValue(fields, ["Application Status", "application status", "Status", "status", "Statut"]),
        comment: getFieldValue(fields, ["Commentaire", "commentaire", "Comment", "comment", "Comments"]),
      }
    })

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Applications fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching applications", details: String(error) },
      { status: 500 }
    )
  }
}
