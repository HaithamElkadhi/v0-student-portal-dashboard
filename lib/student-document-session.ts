import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import type { NextRequest, NextResponse } from "next/server"
import { getAirtableApiKey } from "@/lib/airtable-config"

const cookieName = "student_documents"
const courseCookieName = "student_courses"
const coursePath = "/api/student-courses"
type Identity = { id: string; email: string; folderId: string; expires: number }
function signature(payload: string, name: string) {
  const scope = name === courseCookieName ? "student-courses:" : "student-documents:"
  return createHmac("sha256", getAirtableApiKey()).update(scope + payload).digest("base64url")
}
export function setDocumentSession(response: NextResponse, identity: Omit<Identity, "expires">) {
  setSession(response, identity, cookieName, "/api/student-documents")
}
export function setCourseSession(response: NextResponse, identity: Omit<Identity, "expires">) {
  setSession(response, identity, courseCookieName, coursePath)
}
export function clearCourseSession(response: NextResponse) {
  response.cookies.set(courseCookieName, "", { path: coursePath, maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" })
}
function setSession(response: NextResponse, identity: Omit<Identity, "expires">, name: string, path: string) {
  const payload = Buffer.from(JSON.stringify({ ...identity, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url")
  response.cookies.set(name, payload + "." + signature(payload, name), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path, maxAge: 8 * 60 * 60 })
}
export function documentSession(request: NextRequest) {
  return readSession(request, cookieName)
}
export function courseSession(request: NextRequest) {
  return readSession(request, courseCookieName)
}
function readSession(request: NextRequest, name: string): Identity | null {
  try {
    const [payload, signed, extra] = (request.cookies.get(name)?.value || "").split(".")
    if (!payload || !signed || extra) return null
    const actual = Buffer.from(signed), expected = Buffer.from(signature(payload, name))
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const value = JSON.parse(Buffer.from(payload, "base64url").toString())
    if (!/^rec[a-zA-Z0-9]+$/.test(value.id) || typeof value.email !== "string" || typeof value.folderId !== "string" || typeof value.expires !== "number" || value.expires <= Date.now()) return null
    return value
  } catch { return null }
}
