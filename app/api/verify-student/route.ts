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

    // Helper function to extract file attachments from Airtable
    const getFileAttachments = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        if (fields[name] !== undefined && fields[name] !== null) {
          // Airtable file attachments are arrays of objects
          if (Array.isArray(fields[name]) && fields[name].length > 0) {
            // Check if it's a file attachment (has url property)
            if (fields[name][0] && typeof fields[name][0] === 'object' && 'url' in fields[name][0]) {
              return fields[name].map((file: any) => ({
                id: file.id,
                url: file.url,
                filename: file.filename || 'Unknown file',
                size: file.size || 0,
                type: file.type || 'application/octet-stream'
              }))
            }
          }
        }
      }
      // Try case-insensitive matching
      const fieldKeys = Object.keys(fields)
      for (const possibleName of possibleNames) {
        const matchedKey = fieldKeys.find(
          key => key.toLowerCase() === possibleName.toLowerCase()
        )
        if (matchedKey && fields[matchedKey] !== undefined && fields[matchedKey] !== null) {
          if (Array.isArray(fields[matchedKey]) && fields[matchedKey].length > 0) {
            if (fields[matchedKey][0] && typeof fields[matchedKey][0] === 'object' && 'url' in fields[matchedKey][0]) {
              return fields[matchedKey].map((file: any) => ({
                id: file.id,
                url: file.url,
                filename: file.filename || 'Unknown file',
                size: file.size || 0,
                type: file.type || 'application/octet-stream'
              }))
            }
          }
        }
      }
      return null
    }

    const studentInfo = {
      id: record.id,
      contratSigned: fields["Contrat_Signed"] === true,
      name: getFieldValue(["Name", "name"]),
      surname: getFieldValue(["Surname", "Last Name", "surname", "last name", "Last Name", "Family Name"]),
      email: getFieldValue(["Email", "email", "Email Address", "email address"]) || email || "",
      folderId: getFieldValue(["Prospect ID", "prospect id", "Folder ID", "folder id", "ProspectID", "FolderID"]) || folderId || "",
      phone: getFieldValue(["Phone", "phone", "Phone Number", "phone number", "Mobile", "mobile", "Tel", "tel"]),
      whatsapp: getFieldValue(["WhatsApp", "whatsapp", "Whatsapp", "WhatsApp Number", "whatsapp number"]),
      birthday: getFieldValue(["Birthday", "birthday", "Date of Birth", "date of birth", "DOB", "dob", "Birth Date", "birth date"]),
      citizenship: getFieldValue(["Citizenship", "citizenship", "Nationality", "nationality"]),
      countryOfResidence: getFieldValue(["Country of Residence", "country of residence", "Residence Country", "residence country", "Country", "country"]),
      fullAddress: getFieldValue(["Full Address", "full address", "Address", "address", "Complete Address", "complete address"]),
      passportValidity: getFieldValue(["Passport Validity (months)", "Passport Validity (Months)", "passport validity (months)", "Passport Validity", "passport validity", "Passport Expiry", "passport expiry", "Passport Expiration", "passport expiration"]),
      numberApplications: getFieldValue([
        "Nombre Application",
        "nombre application",
        "nombre applications",
        "Nombre applications",
        "Nombre Applications",
        "Number Applications",
        "Number of Applications",
        "number applications",
        "number of applications",
      ]),
      gender: getFieldValue(["Gender", "gender", "Sex", "sex"]),
      accountStatus: (() => {
        // Use exact field name "Account Status"
        if (fields["Account Status"] !== undefined && fields["Account Status"] !== null && fields["Account Status"] !== "") {
          return fields["Account Status"]
        }
        // Try case-insensitive match for "Account Status" only
        const fieldKeys = Object.keys(fields)
        const accountStatusField = fieldKeys.find(
          key => key.toLowerCase() === "account status"
        )
        if (accountStatusField && fields[accountStatusField] !== undefined && fields[accountStatusField] !== null && fields[accountStatusField] !== "") {
          return fields[accountStatusField]
        }
        // Log for debugging
        console.log("Account Status field lookup:", {
          "Account Status": fields["Account Status"],
          allFields: Object.keys(fields)
        })
        return ""
      })(),
      photo: fields["Photo"] || fields["photo"] || fields["Profile Photo"] || fields["profile photo"] || null,
      // Admission fields
      admission: {
        // Bloc 1 - Proposal
        proposalDocument: getFileAttachments(["Proposal_Document", "Proposal Document", "proposal document", "Proposal_Document", "proposal_document"]) || getFieldValue(["Proposal_Document", "Proposal Document", "proposal document", "Proposal_Document", "proposal_document"]),
        proposalStatus: getFieldValue(["Proposal_Status", "Proposal Status", "proposal status", "proposal_status", "Proposal", "proposal"]),
        // Contrat (prospects) — étape Règlement : fichier présent = étape passée
        contractDocument:
          getFileAttachments([
            "Contrat",
            "contrat",
            "Contract",
            "contract",
            "File contrat",
            "File Contrat",
            "Fichier contrat",
            "Contract File",
            "contract file",
            "Contract_Document",
            "Contract Document",
            "contract document",
            "Contrat fichier",
          ]) ||
          getFieldValue([
            "Contrat",
            "contrat",
            "Contract",
            "contract",
            "File contrat",
            "File Contrat",
            "Fichier contrat",
            "Contract File",
            "contract file",
            "Contract_Document",
            "Contract Document",
            "contract document",
          ]),
        // Bloc 2 - Paiement
        upfrontPaiement: getFieldValue(["UpFront_Paiement", "UpFront Paiement", "upfront paiement", "Upfront Paiement", "Upfront_Paiement", "Payment First Rate Admission", "payment first rate admission", "Payment First Rate", "payment first rate"]),
        finalPaiement: getFieldValue(["Final_Paiement", "Final Paiement", "final paiement", "final_paiement", "Payment Acceptance Fees", "payment acceptance fees", "Paiement Acceptance Fees", "paiement acceptance fees", "Acceptance Fees Payment", "acceptance fees payment"]),
        // Bloc 3 - Documents
        admissionFolderDocuments: getFieldValue(["Admission Folder Documents", "admission folder documents", "Admission Folder documents", "Admission Documents", "admission documents", "Folder Documents", "folder documents"]),
        documentEvaluation: getFieldValue(["Document_Evaluation", "Document Evaluation", "document evaluation", "document_evaluation"]),
        translation: getFieldValue(["Translation", "translation"]),
        declarationOfValue: getFieldValue(["Declaration of value", "Declaration of Value", "declaration of value", "Declaration", "declaration"]),
        languageCertificate:
          getFileAttachments([
            "Language Certificate",
            "language certificate",
            "Language certificate",
            "Language_Certificate",
          ]) ||
          getFieldValue([
            "Language Certificate",
            "language certificate",
            "Language certificate",
            "Language_Certificate",
          ]),
        formulaireDossierOriginal: getFieldValue([
          "Formulaire Dossier Original",
          "formulaire dossier original",
          "Formulaire dossier original",
          "Dossier Original Form",
          "dossier original form",
        ]),
        // Bloc 4 - Requirement
        emailForApplication: (() => {
          // Use exact field name "Email For application" from Airtable Prospects table
          if (fields["Email For application"] !== undefined && fields["Email For application"] !== null && fields["Email For application"] !== "") {
            return fields["Email For application"]
          }
          // Fallback to other variations
          return getFieldValue(["Email For Application", "email for application", "Email for application", "Application Email", "application email", "Email Application", "email application"])
        })(),
        accountUniversitaly: getFieldValue(["Account_Universitaly", "Account Universitaly", "account universitaly", "account_universitaly", "Universitaly Account", "universitaly account"]),
        accountPrenotami: getFieldValue(["Account Pronotami", "Account_Pronotami", "account pronotami", "account_pronotami", "Pronotami Account", "pronotami account", "Account Prenotami", "account prenotami"]),
        // Bloc 5 - Application
        applicationUniversity: getFieldValue(["Application University", "application university", "University", "university", "University Application", "university application"]),
        // Legacy fields (keeping for backward compatibility)
        proposal: getFieldValue(["Proposal", "proposal"]),
        paymentFirstRate: getFieldValue(["Payment First Rate Admission", "payment first rate admission", "Payment First Rate", "payment first rate", "Paiement First Rate Admission", "paiement first rate admission"]),
        application: getFieldValue(["Application", "application", "Application Status", "application status"]),
        admissionPayment: getFieldValue(["Admission Payment", "admission payment", "Admission Paiement", "admission paiement"]),
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
