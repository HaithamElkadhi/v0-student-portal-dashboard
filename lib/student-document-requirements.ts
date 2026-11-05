export type RequiredDocument = { id: string; name: string; urgent: boolean; received: boolean }

// Read the checklist snapshot saved by dashboard/admission-requirements.js.
// The student does not edit the consultant's profile or received flags.
export function requiredDocuments(savedValue: unknown, requestedValue: unknown): RequiredDocument[] {
  if (typeof savedValue === "string" && savedValue.trim()) {
    let saved: { version?: unknown; documents?: unknown; profile?: { received?: unknown } }
    try { saved = JSON.parse(savedValue) } catch { throw new Error("La liste des documents requis doit être vérifiée par votre conseiller.") }
    if (saved.version !== 1 || !Array.isArray(saved.documents) || !saved.profile || !Array.isArray(saved.profile.received)) throw new Error("La liste des documents requis doit être vérifiée par votre conseiller.")
    const received = saved.profile.received
    const seen = new Set<string>()
    return saved.documents.map((doc: { id: unknown; name: unknown; urgency?: unknown }) => {
      if (!doc || typeof doc.id !== "string" || typeof doc.name !== "string" || !doc.id || !doc.name.trim() || seen.has(doc.id)) throw new Error("La liste des documents requis doit être vérifiée par votre conseiller.")
      seen.add(doc.id)
      return { id: doc.id, name: doc.name.trim(), urgent: doc.urgency === "Urgent", received: received.includes(doc.id) }
    })
  }
  // Older dashboard requests are stored as one document name per line.
  return typeof requestedValue === "string" ? [...new Set(requestedValue.split(/\r?\n/).map(line => line.trim()).filter(Boolean))].map((name, index) => ({ id: "requested-" + index, name, urgent: false, received: false })) : []
}
