/**
 * Résolution du filtre Airtable pour la table Paiements :
 * — nom de champ exact issu du schéma (casse / accents)
 * — champ texte : {Champ} = "ID dossier"
 * — lien vers Prospects : résolution du record Prospects puis FIND / égalité sur record id
 */

export type AirtableFieldMeta = { name: string; type: string; options?: { linkedTableId?: string } }

export function escapeAirtableFormulaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function isLinkField(t: string) {
  return t === "multipleRecordLinks" || t === "singleRecordLink"
}

function isTextLikeFilterField(t: string) {
  return (
    t === "singleLineText" ||
    t === "multilineText" ||
    t === "email" ||
    t === "phoneNumber" ||
    t === "url" ||
    t === "singleSelect" ||
    t === "multipleSelects" ||
    t === "formula" ||
    t === "rollup" ||
    t === "multipleLookupValues"
  )
}

/** Trouve le champ à utiliser : env explicite, sinon heuristique sur les noms */
export function resolveProspectField(
  fields: AirtableFieldMeta[],
  explicitFromEnv: string | undefined,
): AirtableFieldMeta | null {
  const trimmed = explicitFromEnv?.trim()
  if (trimmed) {
    const exact = fields.find((f) => f.name === trimmed)
    if (exact) return exact
    const ci = fields.find((f) => f.name.toLowerCase() === trimmed.toLowerCase())
    if (ci) return ci
    return null
  }

  const nameCandidates = [
    "Prospect ID",
    "ID Prospect",
    "ID prospect",
    "Prospect",
    "Dossier",
    "Folder ID",
    "N° dossier",
    "Numéro dossier",
  ]

  for (const name of nameCandidates) {
    const f = fields.find((x) => x.name === name)
    if (f && (isTextLikeFilterField(f.type) || isLinkField(f.type))) return f
  }

  const fuzzy = fields.find(
    (f) =>
      /prospect|dossier|folder/i.test(f.name) &&
      /id|n°|num|numero/i.test(f.name) &&
      (isTextLikeFilterField(f.type) || isLinkField(f.type)),
  )
  if (fuzzy) return fuzzy

  const linkOnly = fields.find((f) => isLinkField(f.type) && /^prospect$/i.test(f.name.trim()))
  if (linkOnly) return linkOnly

  const linkProspect = fields.find((f) => isLinkField(f.type) && /prospect/i.test(f.name))
  if (linkProspect) return linkProspect

  return null
}

/** Champ texte / lookup pour filtrer par email (ex. lookup « Email » depuis Prospects) */
export function resolveEmailMatchField(
  fields: AirtableFieldMeta[],
  explicitFromEnv: string | undefined,
): AirtableFieldMeta | null {
  const trimmed = explicitFromEnv?.trim()
  if (trimmed) {
    const exact = fields.find((f) => f.name === trimmed)
    if (exact && isTextLikeFilterField(exact.type)) return exact
    const ci = fields.find((f) => f.name.toLowerCase() === trimmed.toLowerCase())
    if (ci && isTextLikeFilterField(ci.type)) return ci
    return null
  }
  const byName = fields.find(
    (f) =>
      isTextLikeFilterField(f.type) &&
      (/^email$/i.test(f.name.trim()) || /e-mail|mail|email/i.test(f.name)),
  )
  return byName ?? null
}

export function listFieldNamesForError(fields: AirtableFieldMeta[]): string[] {
  return fields.map((f) => `${f.name} (${f.type})`)
}