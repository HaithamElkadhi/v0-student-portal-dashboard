import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"
import { airtableFetch } from "@/lib/airtable-fetch"
import { clearCourseSession, courseSession } from "@/lib/student-document-session"

const endpoint = `https://api.airtable.com/v0/${AIRTABLE.baseId}/tblb6kZ3B8QOOzuEf`
const recordId = /^rec[a-zA-Z0-9]{14}$/
const searchKeys = ["query", "sort", "university", "degree", "language", "status"] as const
type Search = Record<(typeof searchKeys)[number], string>
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } })

function student(request: NextRequest) {
  const session = courseSession(request)
  if (!session) return null
  const account = encodeURIComponent(JSON.stringify([session.email.trim().toLowerCase(), session.folderId]))
  return request.headers.get("x-course-account") === account ? session : null
}

function parseSearch(input: unknown): Search | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null
  const search = input as Search
  if (searchKeys.some(key => typeof search[key] !== "string" || search[key].length > (key === "query" ? 160 : 300))) return null
  if (!["relevance", "title", "deadline"].includes(search.sort)) return null
  return { query: search.query, sort: search.sort, university: search.university, degree: search.degree, language: search.language, status: search.status }
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
    const searches: { search: Search; createdTime: string }[] = []
    const url = new URL(endpoint)
    url.searchParams.set("filterByFormula", `AND({Active}, LEFT({Save Key}, ${session.id.length + 1}) = "${session.id}:")`)
    for (const field of ["Kind", "Value"]) url.searchParams.append("fields[]", field)
    let offset: string | undefined
    do {
      if (offset) url.searchParams.set("offset", offset)
      const data = await requestAirtable(url.toString())
      for (const { fields, createdTime } of data.records) {
        if (typeof fields.Value !== "string") continue
        if (fields.Kind === "favorite" && recordId.test(fields.Value)) favorites.add(fields.Value)
        if (fields.Kind === "search") {
          try {
            const search = parseSearch(JSON.parse(fields.Value))
            if (search) searches.push({ search, createdTime })
          } catch {
            // Skip malformed entries edited in Airtable.
          }
        }
      }
      offset = data.offset
    } while (offset)
    searches.sort((a, b) => b.createdTime.localeCompare(a.createdTime))
    return json({ favorites: [...favorites], searches: searches.map(({ search }) => search) })
  } catch (error) {
    console.error("Unable to load course saves", error)
    return json({ error: "Your saved items could not be loaded. Try again." }, 502)
  }
}

export async function PUT(request: NextRequest) {
  const session = student(request)
  if (!session) return json({ error: "Sign in again to access your saves." }, 401)

  const input = await request.json().catch(() => null)
  if (!input || typeof input.active !== "boolean" || !["favorite", "search"].includes(input.kind)) {
    return json({ error: "Invalid save request." }, 400)
  }
  const favorite = input.kind === "favorite"
  const search = favorite ? null : parseSearch(input.value)
  if (favorite ? typeof input.value !== "string" || !recordId.test(input.value) : !search) {
    return json({ error: "Invalid course or search." }, 400)
  }

  const value = favorite ? input.value : JSON.stringify(search)
  const itemKey = favorite ? value : createHash("sha256").update(value).digest("hex")
  try {
    await requestAirtable(endpoint, {
      method: "PATCH",
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: ["Save Key"] },
        records: [{
          fields: {
            "Save Key": `${session.id}:${input.kind}:${itemKey}`,
            Student: [session.id],
            Course: favorite && input.active ? [value] : [],
            Kind: input.kind,
            Value: input.active ? value : "",
            Active: input.active,
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
