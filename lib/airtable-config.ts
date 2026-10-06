export const AIRTABLE = {
  baseId: "appkqvTuc8F0AhWPp",
  tables: {
    prospects: { id: "tblQPh56AAmCe1bTj", fields: { name: "fldrjpZMHxXReuVBK", surname: "fldrlBOVl9Rd2wIff", email: "fldWBOtlmuPIXdsep" } },
    bourseDocuments: {
      id: "tbl7qGYTAKarKrGNn",
      fields: {
        submissionDate: "fldRcaQssXLUDlmVe",
        prospect: "fldqnqmR3GsouwBux",
        householdMembers: "fld8gNl1RQ9QLBt0L",
        dossierStatus: "fldUz9ib1shIzw214",
        birthCertificates: "fldFEqqFT5aDClPVu",
        familyBooklet: "fldFMro4OqzaN2OK4",
        propertyDocs: "fldLDhgKHVdfGRHin",
        nonPropertyDocs: "fldiBfgBJJh6alXT3",
        balanceAttestation: "fld1F6Qoa4e5Y8Xsx",
        taxDeclarations: "fldQw9wQfvM9dYKFx",
        otherDocuments: "fldv0Ls0B3j3KwArG",
      },
    },
    documents: {
      id: "tbl4qg0oCDDMm6nfc",
      fields: {
        name: "flduCzBz6r4mbeyR6",
        prospect: "flddLbOxT5ONdCPWX",
        email: "fldvXXUGFdfSKRAjl",
        submissionDate: "fld8DrbLEdxg0D4JE",
        diplomaLevel: "fldo1JjqlT5kcO9eZ",
        fieldOfStudy: "fldLz8dT90dTAEQed",
        scoreFormat: "fldhfzzwpyesvUG2p",
        scoreValue: "fldByb2VC7zf4PvLp",
        gapYears: "flduV0meKEUlon4xz",
        gapDescription: "fldp6UeYZT5Q9Tbe2",
        gapDocTypes: "fldPj1ZezVOODe5EY",
        passportExpiry: "fldZA6EiC0DH6h8G3",
        languageCertName: "fldM0K2xgtpbanO1z",
        documents: "fldlw19MuDmTwg7iy",
        documentsStatus: "fldif76Ukh0xKQDoH",
        dossierSubmitted: "fldHe22CIKSrHo9aK",
        totalExpected: "fldjiRsKUUxt7Ra78",
        submittedCount: "fldTT09a4RdZmRvOh",
      },
    },

    tasks: {
      id: "tblkmA6khmu06nmSb",
      fields: {
        prospectName: "flde1U5nx74Xcwyft",
        clientEmail: "fldOeDhTRKcby0jKO",
        clientPhone: "fldslsb7PRy8cSCHg",
        taskType: "fldjYnfISDfXSmv1c",
        ticketType: "fldSjR5EVnhvC0qer",
        taskObject: "fldsLCGHg6yeQHtzg",
        description: "fld6KhpKoJl0KqWCK",
        attachment: "fldQUFTfeAHWUsuLk",
        taskStatus: "fldD9zlILdlxUHFNh",
        linkedProspect: "fldjSWmfcfKoSdJzS",
        ticketRef: "fldREmahsaEC8gl87",
      },
    },
  },
} as const;
export function getAirtableApiKey(): string {
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) {
    throw new Error("AIRTABLE_API_KEY is not set");
  }
  return key;
}
