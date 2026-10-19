import { randomUUID } from "node:crypto"

export const STUDENT_LOGIN_TABLE = "tblRaMM6tWRUg0YJo"

/** Only explicit, successful login attempts are recorded; refreshes never call this. */
export async function recordStudentLogin(input: {
  baseId: string
  apiKey: string
  studentId: string
  email: string
  folderId: string
  method: "Email" | "Numéro de dossier"
}) {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${input.baseId}/${STUDENT_LOGIN_TABLE}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${input.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: {
        fldUmb336oFKmqDQ7: randomUUID(),
        fldOHUGhjzk9ztXGX: [input.studentId],
        fldVDFlajeDnb7HsW: new Date().toISOString(),
        fld7de4YTlGUp9LXG: input.email,
        fld8kuoYhNUTDw9sp: input.folderId,
        fldnlPdTXjoU38ccc: input.method,
      } }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })
    if (!response.ok) console.error("[student-login-history] Unable to record login:", response.status)
  } catch {
    // Tracking must not prevent a student from accessing their dossier.
    console.error("[student-login-history] Login tracking unavailable")
  }
}
