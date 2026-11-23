import "server-only"
import { documentRequest } from "@/lib/student-document-store"

const fields = {
  username: "fld6GymQ8Gh6hQnwX",
  labels: "fldU8qYxw1o9pJaoF",
  owner: "flduaQtpEJlr03ivQ",
  link: "fld4kKOkH1VvqUfUk",
  password: "fld18yBzVSD5BtP3y",
}
type Record = { id: string; createdTime: string; fields: { [key: string]: unknown } }
const text = (value: unknown) => typeof value === "string" ? value : ""

function safeUrl(value: unknown) {
  try {
    const url = new URL(text(value))
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""
  } catch { return "" }
}
export async function loadStudentAccounts(studentId: string, studentFields: { [key: string]: unknown }, includeCredentials = false) {
  const requestedFields = [fields.username, fields.labels, fields.owner]
  if (includeCredentials) requestedFields.push(fields.password, fields.link)
  const linked = studentFields.flddNBP0jC3rYtcF0
  const ids: string[] = Array.isArray(linked)
    ? [...new Set(linked.filter((id): id is string => typeof id === "string" && /^rec[a-zA-Z0-9]+$/.test(id)))]
    : []
  const accounts = []
  for (let index = 0; index < ids.length; index += 50) {
    const params = new URLSearchParams({
      returnFieldsByFieldId: "true",
      filterByFormula: "OR(" + ids.slice(index, index + 50).map(id => `RECORD_ID()='${id}'`).join(",") + ")",
    })
    for (const field of requestedFields) params.append("fields[]", field)
    const page = await documentRequest("tblEQbtTmVkMlTbUV?" + params)
    for (const record of (page.records ?? []) as Record[]) {
      const owner = record.fields[fields.owner]
      if (!ids.includes(record.id) || !Array.isArray(owner) || !owner.includes(studentId)) continue
      const labels = record.fields[fields.labels]
      accounts.push({
        id: record.id,
        createdTime: record.createdTime,
        username: text(record.fields[fields.username]),
        labels: Array.isArray(labels) ? labels.filter((label): label is string => typeof label === "string") : [],
        password: text(record.fields[fields.password]),
        url: safeUrl(record.fields[fields.link]),
      })
    }
  }
  return accounts.sort((a, b) => b.createdTime.localeCompare(a.createdTime))
}

export function applicationEmailFromAccounts(accounts: { username: string; labels: string[] }[]): string {
  return accounts.find(account => account.username.trim() && account.labels.some(label => label.trim().toLowerCase() === "email candidature"))?.username.trim() ?? ""
}
