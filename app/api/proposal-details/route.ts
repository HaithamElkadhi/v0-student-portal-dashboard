import { NextRequest, NextResponse } from "next/server"
import { AIRTABLE, getAirtableApiKey } from "@/lib/airtable-config"

const groups = [
  { title: "Fiche d’orientation", fields: [["Date de fiche d’orientation","fld2ZlqIvPPC8oG5j"],["Valable jusqu’au","fldnJkPg1xCT10Xqm"]] },
  { title: "Profil étudiant", fields: [["Nationalité","fldmG4KgxlZIWe5yC"],["Situation actuelle","fldvzq0VUdgCELdRf"],["Niveau académique","fldGeykWH8oKFr03M"],["Diplômes obtenus","fld1P0dI80wYuEXe1"],["Études précédentes","fldlr2jdQRHs74t9r"],["Année de diplôme","fldsot30LGlll8oss"],["Occupation actuelle","fldqTBJ1GLInyIHws"],["Parcours académique","fldgGMhu1oFDV8YbF"],["Langues","fld2HHy6pgpQJmUNv"],["Parcours linguistique","flduGDlcArGZHrWOA"],["Votre demande","fldDSjd53LKbUsv1z"]] },
  { title: "Préférences d’études", fields: [["Diplôme visé","fldC85ZK7TfLJc6N2"],["Rentrée souhaitée","fldWgAo9MCS0PQ0Qb"],["Domaine principal","fldIYBuTapsL6oHnz"],["Domaine alternatif","fldW1lu6RJLB6cUT1"],["Préférence de ville","fldUitTkCZNanMcID"],["Ville / université souhaitée","fldFXkXX9HgLVI1bm"],["Langues du programme","fldGVRtZ7aFnr5KM0"]] },
  { title: "Situation financière", fields: [["Plan de financement","fldLPAvvz286zcxz2"],["Garant financier","fldKXmKZb2TVgDfNE"],["Budget disponible (€)","fldLQp9TJZTDadP6L"],["Compte bloqué","fldjhqSyAPCnznYAs"],["Soutien depuis l’étranger","fldqst8OaoMhb9xTJ"],["Détails du soutien","fld0i1plGROk8Dq1X"]] },
  { title: "Services", fields: [["Services sélectionnés","fld6WnYXTMlgzsQl3"],["Notes sur les services","fldpvCWSHQtq5dzaF"]] },
]
export async function GET(request: NextRequest) {
  const prospectId = request.nextUrl.searchParams.get("prospectId")?.trim()
  if (!prospectId || !/^[a-zA-Z0-9_-]+$/.test(prospectId)) return NextResponse.json({ error: "Identifiant obligatoire." }, { status: 400 })
  try {
    const escaped = prospectId;
    const url = new URL("https://api.airtable.com/v0/" + AIRTABLE.baseId + "/" + AIRTABLE.tables.prospects.id)
    url.searchParams.set("filterByFormula", '{Prospect ID}="' + escaped + '"')
    url.searchParams.set("returnFieldsByFieldId", "true")
    url.searchParams.set("maxRecords", "1")
    const res = await fetch(url, { headers: { Authorization: "Bearer " + getAirtableApiKey() }, cache: "no-store" })
    if (!res.ok) throw new Error("Proposal read failed")
    const data = await res.json()
    const fields = data.records?.[0]?.fields
    if (!fields) return NextResponse.json({ error: "Fiche d’orientation introuvable." }, { status: 404 })
    const completionIds = ["fldmG4KgxlZIWe5yC","fldvzq0VUdgCELdRf","fldGeykWH8oKFr03M","fld1P0dI80wYuEXe1","fldgGMhu1oFDV8YbF","fldlr2jdQRHs74t9r","fldsot30LGlll8oss","fld2HHy6pgpQJmUNv","flduGDlcArGZHrWOA","fldC85ZK7TfLJc6N2","fldWgAo9MCS0PQ0Qb","fldIYBuTapsL6oHnz","fldGVRtZ7aFnr5KM0","fldUitTkCZNanMcID","fldLPAvvz286zcxz2","fldKXmKZb2TVgDfNE","fldjhqSyAPCnznYAs","fldqst8OaoMhb9xTJ","fldLQp9TJZTDadP6L","fld6WnYXTMlgzsQl3"]
    const filled = completionIds.filter(id => {
      const value = fields[id]
      if (value == null) return false
      if (Array.isArray(value)) return value.length > 0
      return typeof value === "number" || String(value).trim() !== ""
    }).length
    const percent = Math.round(filled / completionIds.length * 100)
    return NextResponse.json({ percent, groups: groups.map(group => ({ title: group.title, fields: group.fields.map(([label,id]) => ({ label, value: fields[id] ?? null })) })) })
  } catch (error) {
    console.error("[proposal-details]", error)
    return NextResponse.json({ error: "Impossible de charger la fiche d’orientation." }, { status: 502 })
  }
}
