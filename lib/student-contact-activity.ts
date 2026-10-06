type Event = { key: string; kind: string; at: string; title: string; status?: string; appointmentAt?: string }
type Read = (path: string) => Promise<any>
export async function studentContactActivity(read: Read, id: string, email: string, history: string) {
  const events: Event[] = history.split("\n").map(line => line.trim()).filter(Boolean).map((line, index) => {
    const m = line.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*[—–-]\s*(.*)$/)
    return { key: "contact:" + index, kind: "contact", at: m ? m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0") : "", title: m ? m[4] : line }
  })
  const warnings: string[] = []
  const owned = (ids: unknown, recipient: unknown) => Array.isArray(ids) && ids.length ? ids.includes(id) : typeof recipient === "string" && recipient.trim().toLowerCase() === email.toLowerCase()
  async function source(table: string, fields: string[], map: (r: any) => Event | null, formula?: string, byId = false) {
    try {
      let offset: string | undefined
      do {
        const params = new URLSearchParams({ pageSize: "100" })
        fields.forEach(field => params.append("fields[]", field))
        if (formula) params.set("filterByFormula", formula)
        if (byId) params.set("returnFieldsByFieldId", "true")
        if (offset) params.set("offset", offset)
        const page = await read(table + "?" + params)
        for (const r of page.records || []) { const event = map(r); if (event) events.push(event) }
        offset = page.offset
      } while (offset)
    } catch { warnings.push(table) }
  }
  await source("tblkmA6khmu06nmSb", ["Type", "Objet", "Task Status", "Linked Prospect", "Client Email", "Date de création"], r => {
    const f = r.fields; return owned(f["Linked Prospect"], f["Client Email"]) ? { key: "ticket:" + r.id, kind: "ticket", at: f["Date de création"] || r.createdTime, title: f.Objet || "Ticket créé", status: f["Task Status"] || "" } : null
  }, "{Type}='Ticket'")
  await source("tblYHIcXwoMupWnaC", ["fldhR4N2XROZGK7Ha", "fldasDMrcwqX9tVNp", "fld3ZWw07FlWQz6xj", "fldZHQnFb6uOQ3pNg", "fldrAHy70gOEIVmH5"], r => {
    const f = r.fields; return owned(f.fldhR4N2XROZGK7Ha, f.fldasDMrcwqX9tVNp) ? { key: "booking:" + r.id, kind: "appointment", at: r.createdTime, title: f.fldrAHy70gOEIVmH5 || "Rendez-vous réservé", status: f.fldZHQnFb6uOQ3pNg, appointmentAt: f.fld3ZWw07FlWQz6xj } : null
  }, undefined, true)
  await source("tblRmPz47Tclxz3od", ["Student Record ID", "Occurred At", "Subject", "Recipient", "Provider ID"], r => {
    const f = r.fields; return owned(f["Student Record ID"] ? [f["Student Record ID"]] : [], f.Recipient) ? { key: f["Provider ID"] ? "email:" + f["Provider ID"] : "document-email:" + r.id, kind: "email", at: f["Occurred At"] || r.createdTime, title: f.Subject || "Email envoyé", status: "Sent" } : null
  }, "AND({Action}='Email',{Result}='Sent')")
  await source("tblh1SfFHOgW7gLPK", ["Provider ID", "Recipient", "Subject", "Sent At"], r => {
    const f = r.fields; return owned([], f.Recipient) ? { key: "email:" + (f["Provider ID"] || r.id), kind: "email", at: f["Sent At"] || r.createdTime, title: f.Subject || "Email envoyé", status: "Sent" } : null
  })
  return { events: [...new Map(events.map(event => [event.key, event])).values()].sort((a,b) => (b.at || "").localeCompare(a.at || "")), partial: warnings.length > 0 }
}
