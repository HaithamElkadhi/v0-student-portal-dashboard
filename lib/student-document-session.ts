import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import type { NextRequest, NextResponse } from "next/server"
import { getAirtableApiKey } from "@/lib/airtable-config"

const cookieName = "student_documents"
type Identity = { id: string; email: string; folderId: string; expires: number }
function signature(payload: string) {
  return createHmac("sha256", getAirtableApiKey()).update("student-documents:" + payload).digest("base64url")
}
export function setDocumentSession(response: NextResponse, identity: Omit<Identity, "expires">) {
  const payload = Buffer.from(JSON.stringify({ ...identity, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url")
  response.cookies.set(cookieName, payload + "." + signature(payload), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/student-documents", maxAge: 8 * 60 * 60 })
}
export function documentSession(request: NextRequest): Identity | null {
  try {
    const [payload, signed, extra] = (request.cookies.get(cookieName)?.value || "").split(".")
    if (!payload || !signed || extra) return null
    const actual = Buffer.from(signed), expected = Buffer.from(signature(payload))
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const value = JSON.parse(Buffer.from(payload, "base64url").toString())
    if (!/^rec[a-zA-Z0-9]+$/.test(value.id) || typeof value.email !== "string" || typeof value.folderId !== "string" || typeof value.expires !== "number" || value.expires <= Date.now()) return null
    return value
  } catch { return null }
}
