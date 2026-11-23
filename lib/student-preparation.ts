import { readApplicationEmail } from "@/lib/airtable-config"
import { requiredDocuments } from "@/lib/student-document-requirements"

export const preparationTestTypes = ["Cacher", "IELTS ou équivalent", "CISIA ou équivalent", "EF Test"] as const
export type PreparationTestType = "" | typeof preparationTestTypes[number]
type FollowUp = { done: boolean; note: string }
export type StudentPreparation = {
  identity: { done: boolean; applicationEmail: string }
  meeting: FollowUp
  documents: { done: boolean; count: number; error: boolean }
  mousad9a: { done: boolean }
  translation: { done: boolean }
  test: FollowUp & { type: PreparationTestType }
  dv: { status: "Non fait" | "Rendez-vous pris" | "Fait"; done: boolean; note: string }
  deposit: FollowUp
}

const text = (value: unknown) => typeof value === "string" ? value : ""

export function studentPreparation(fields: Record<string, unknown>, linkedApplicationEmail = ""): StudentPreparation {
  const applicationEmail = linkedApplicationEmail || readApplicationEmail(fields)
  let documents: StudentPreparation["documents"] = { done: false, count: 0, error: false }
  if (fields.fldsMJ7gvO2Qz9UzT) {
    try {
      const count = requiredDocuments(fields.fldsMJ7gvO2Qz9UzT, "").length
      documents = { done: count > 0, count, error: false }
    } catch {
      documents = { done: false, count: 0, error: true }
    }
  }
  const type = preparationTestTypes.find(type => type === fields.fldJs1RQZowDj3XDT) || ""
  const status = fields.fldZMP2nd2ziXdLHp === "Fait" || fields.fldZMP2nd2ziXdLHp === "Rendez-vous pris"
    ? fields.fldZMP2nd2ziXdLHp : "Non fait"
  return {
    identity: { done: Boolean(applicationEmail), applicationEmail },
    meeting: { done: fields.fldmzKbBTH2hcZGiO === true, note: text(fields.fldxTej8hHvwewEPd) },
    documents,
    mousad9a: { done: fields.fld2YHuug3Idlz1zb === true },
    translation: { done: fields.fldc3wGaASfUESuQP === true },
    test: { type, done: type !== "Cacher" && fields.flddPj5ksWs0wLcCF === true, note: text(fields.fldy5VYn41gMTSeRC) },
    dv: { status, done: status === "Fait" || status === "Rendez-vous pris", note: text(fields.fldf4cSkiS8DHMTY3) },
    deposit: { done: fields.fldVsPZX5T0OO0VhS === true, note: text(fields.fld0t9hHbtgI873j6) },
  }
}
