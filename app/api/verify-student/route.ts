import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, folderId } = body

    if (!email && !folderId) {
      return NextResponse.json(
        { error: "Email or Folder ID is required" },
        { status: 400 }
      )
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
      console.error("Missing Airtable environment variables", {
        hasApiKey: !!AIRTABLE_API_KEY,
        hasBaseId: !!AIRTABLE_BASE_ID,
        hasTableId: !!AIRTABLE_TABLE_ID,
      })
      return NextResponse.json(
        { error: "Server configuration error: Missing environment variables" },
        { status: 500 }
      )
    }

    // Build the filter formula
    let filterFormula = ""
    if (email && folderId) {
      filterFormula = `OR({Email} = "${email}", {Prospect ID} = "${folderId}")`
    } else if (email) {
      filterFormula = `{Email} = "${email}"`
    } else if (folderId) {
      filterFormula = `{Prospect ID} = "${folderId}"`
    }

    // Query Airtable - encode table name properly
    const encodedTableId = encodeURIComponent(AIRTABLE_TABLE_ID)
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedTableId}?filterByFormula=${encodeURIComponent(filterFormula)}`
    
    console.log("Querying Airtable:", {
      baseId: AIRTABLE_BASE_ID,
      tableId: AIRTABLE_TABLE_ID,
      filterFormula,
      url: url.replace(AIRTABLE_API_KEY, "***"),
    })
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      let errorMessage = "Failed to verify student"
      
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
        url: url,
        tableId: AIRTABLE_TABLE_ID,
      })
      
      return NextResponse.json(
        { 
          error: errorMessage || "Failed to verify student",
          details: response.status === 403 ? "Access forbidden. Please check your API key permissions." : undefined
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.records || data.records.length === 0) {
      return NextResponse.json(
        { error: "Student not found. Please check your email or Prospect ID." },
        { status: 404 }
      )
    }

    // Extract student information from the first matching record
    const record = data.records[0]
    const fields = record.fields

    // Log all available fields for debugging
    console.log("Available Airtable fields:", Object.keys(fields))
    console.log("Field values:", fields)
    console.log("Looking for Email For Application field, found:", {
      "Email For Application": fields["Email For Application"],
      "email for application": fields["email for application"],
      "Email for application": fields["Email for application"],
      "Application Email": fields["Application Email"],
      "Email Application": fields["Email Application"],
    })

    // First, let's get the schema to know exact field names
    let schemaFields: { [key: string]: any } = {}
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
        const prospectsTable = schemaData.tables?.find(
          (table: any) => table.name === AIRTABLE_TABLE_ID || table.id === AIRTABLE_TABLE_ID
        )
        
        if (prospectsTable) {
          prospectsTable.fields?.forEach((field: any) => {
            schemaFields[field.name] = field.type
          })
          console.log("Schema fields:", schemaFields)
        }
      }
    } catch (schemaError) {
      console.error("Error fetching schema:", schemaError)
    }

    // Map Airtable fields to our student info structure using exact field names from schema
    // We'll try to match fields intelligently
    const getFieldValue = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        if (fields[name] !== undefined && fields[name] !== null && fields[name] !== "") {
          return fields[name]
        }
      }
      // Try case-insensitive matching
      const fieldKeys = Object.keys(fields)
      for (const possibleName of possibleNames) {
        const matchedKey = fieldKeys.find(
          key => key.toLowerCase() === possibleName.toLowerCase()
        )
        if (matchedKey && fields[matchedKey] !== undefined && fields[matchedKey] !== null && fields[matchedKey] !== "") {
          return fields[matchedKey]
        }
      }
      return ""
    }

    const studentInfo = {
      id: record.id,
      name: getFieldValue(["Name", "Full Name", "First Name", "name", "full name", "first name"]),
      surname: getFieldValue(["Surname", "Last Name", "surname", "last name", "Last Name", "Family Name"]),
      email: getFieldValue(["Email", "email", "Email Address", "email address"]) || email || "",
      folderId: getFieldValue(["Prospect ID", "prospect id", "Folder ID", "folder id", "ProspectID", "FolderID"]) || folderId || "",
      phone: getFieldValue(["Phone", "phone", "Phone Number", "phone number", "Mobile", "mobile", "Tel", "tel"]),
      whatsapp: getFieldValue(["WhatsApp", "whatsapp", "Whatsapp", "WhatsApp Number", "whatsapp number"]),
      birthday: getFieldValue(["Birthday", "birthday", "Date of Birth", "date of birth", "DOB", "dob", "Birth Date", "birth date"]),
      citizenship: getFieldValue(["Citizenship", "citizenship", "Nationality", "nationality"]),
      countryOfResidence: getFieldValue(["Country of Residence", "country of residence", "Residence Country", "residence country", "Country", "country"]),
      fullAddress: getFieldValue(["Full Address", "full address", "Address", "address", "Complete Address", "complete address"]),
      passportValidity: getFieldValue(["Passport Validity", "passport validity", "Passport Expiry", "passport expiry", "Passport Expiration", "passport expiration"]),
      gender: getFieldValue(["Gender", "gender", "Sex", "sex"]),
      photo: fields["Photo"] || fields["photo"] || fields["Profile Photo"] || fields["profile photo"] || null,
      // Admission fields
      admission: {
        proposal: getFieldValue(["Proposal", "proposal"]),
        paymentFirstRate: getFieldValue(["Payment First Rate Admission", "payment first rate admission", "Payment First Rate", "payment first rate", "Paiement First Rate Admission", "paiement first rate admission"]),
        emailForApplication: getFieldValue(["Email For application", "Email For Application", "email for application", "Email for application", "Application Email", "application email", "Email Application", "email application"]),
        declarationOfValue: getFieldValue(["Declaration of Value", "declaration of value", "Declaration", "declaration"]),
        translation: getFieldValue(["Translation", "translation"]),
        admissionFolderDocuments: getFieldValue(["Admission Folder Documents", "admission folder documents", "Admission Documents", "admission documents", "Folder Documents", "folder documents"]),
        application: getFieldValue(["Application", "application", "Application Status", "application status"]),
        admissionPayment: getFieldValue(["Admission Payment", "admission payment", "Admission Paiement", "admission paiement"]),
        applicationUniversity: getFieldValue(["Application University", "application university", "University", "university", "University Application", "university application"]),
        paymentAcceptanceFees: getFieldValue(["Payment Acceptance Fees", "payment acceptance fees", "Paiement Acceptance Fees", "paiement acceptance fees", "Acceptance Fees Payment", "acceptance fees payment"]),
      },
    }

    return NextResponse.json({
      success: true,
      student: studentInfo,
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    )
  }
}
