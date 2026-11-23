import { favoriteCoursesPdf } from "./favorite-courses-pdf"
import { NextResponse, type NextRequest } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { airtableFetch } from "@/lib/airtable-fetch"
import { clearCourseSession, courseSession } from "@/lib/student-document-session"

const endpoint = `https://api.airtable.com/v0/${AIRTABLE.baseId}/tblb6kZ3B8QOOzuEf`
const recordId = /^rec[a-zA-Z0-9]{14}$/
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } })

function student(request: NextRequest) {
  const session = courseSession(request)
  if (!session) return null
  const account = encodeURIComponent(JSON.stringify([session.email.trim().toLowerCase(), session.folderId]))
  return request.headers.get("x-course-account") === account ? session : null
}

async function requestAirtable(url: string, init?: RequestInit) {
  const response = await airtableFetch(url, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${getAirtableApiKey()}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Airtable returned ${response.status}`)
  return response.json()
}

export async function GET(request: NextRequest) {
  const session = student(request)
  if (!session) return json({ error: "Sign in again to access your saves." }, 401)

  try {
    const favorites = new Set<string>()
    const url = new URL(endpoint)
    url.searchParams.set("filterByFormula", `AND({Active}, {Kind} = "favorite", LEFT({Save Key}, ${session.id.length + 1}) = "${session.id}:")`)
    for (const field of ["Kind", "Value"]) url.searchParams.append("fields[]", field)
    let offset: string | undefined
    do {
      if (offset) url.searchParams.set("offset", offset)
      const data = await requestAirtable(url.toString())
      for (const { fields, createdTime } of data.records) {
        if (typeof fields.Value !== "string") continue
        if (fields.Kind === "favorite" && recordId.test(fields.Value)) favorites.add(fields.Value)
      }
      offset = data.offset
    } while (offset)
    if (request.nextUrl.searchParams.get("format") === "pdf") {
      if (!favorites.size) return json({ error: "You have no favorite courses." }, 400)
      return await favoriteCoursesPdf(favorites)
    }
    return json({ favorites: [...favorites] })
  } catch (error) {
    console.error("Unable to load course saves", error)
    return json({ error: "Your saved items could not be loaded. Try again." }, 502)
  }
}

export async function PUT(request: NextRequest) {
  const session = student(request)
  if (!session) return json({ error: "Sign in again to access your saves." }, 401)

  const input = await request.json().catch(() => null)
  if (!input || input.kind !== "favorite" || typeof input.active !== "boolean" ||
      typeof input.value !== "string" || !recordId.test(input.value)) {
    return json({ error: "Invalid favorite request." }, 400)
  }

  const { value, active } = input
  try {
    await requestAirtable(endpoint, {
      method: "PATCH",
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: ["Save Key"] },
        records: [{
          fields: {
            "Save Key": `${session.id}:favorite:${value}`,
            Student: [session.id],
            Course: active ? [value] : [],
            Kind: "favorite",
            Value: active ? value : "",
            Active: active,
          },
        }],
      }),
    })
    return json({ success: true })
  } catch (error) {
    console.error("Unable to update a course save", error)
    return json({ error: "Your changes could not be saved. Try again." }, 502)
  }
}

export async function DELETE(request: NextRequest) {
  const response = json({ success: true })
  if (student(request)) clearCourseSession(response)
  return response
}
