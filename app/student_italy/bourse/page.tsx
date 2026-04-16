import { Card } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

export default function StudentItalyScholarshipPage() {
  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-700">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Bourse</h1>
          <p className="mt-1 text-sm text-zinc-600">Bientôt disponible.</p>
        </div>
      </div>
    </Card>
  )
}
