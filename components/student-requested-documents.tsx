import { FileText } from "lucide-react"

export default function StudentRequestedDocuments({ text }: { text?: string }) {
  const sections = text?.trim().split(/\n\s*\n/).filter(Boolean) ?? []
  if (!sections.length) return <p className="py-4 text-sm text-zinc-500">Aucun document demandé pour le moment.</p>
  return <div className="space-y-4">{sections.map((section, index) => {
    const lines = section.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    const heading = lines[0]?.endsWith(":") ? lines.shift() : null
    return <section key={index} className="rounded-xl border border-zinc-200 bg-white p-4">
      {heading && <h3 className="mb-3 break-words text-sm font-semibold text-zinc-900">{heading}</h3>}
      <ul className="space-y-3">{lines.map((line, lineIndex) => <li key={lineIndex} className="flex items-start gap-2.5"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden /><p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700">{line.replace(/^(?:[-*•]\s+|\d+[.)]\s+)/, "")}</p></li>)}</ul>
    </section>
  })}</div>
}
