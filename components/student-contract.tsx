"use client"

import { useState } from "react"
import { useStudentPortal } from "@/components/student-portal-context"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, Loader2, ShieldCheck } from "lucide-react"

const CONTRACT_SECTIONS = [
  {
    title: "1. Objet du contrat",
    content:
      "Le présent contrat a pour objet l'accompagnement du Client dans ses démarches d'admission dans des universités publiques en Italie, incluant l'orientation, la préparation du dossier, le suivi administratif et l'assistance pour les procédures liées (admission, bourse, visa).",
  },
  {
    title: "2. Mandat et représentation",
    content:
      "Le Client autorise JEEXPERT STUDY à agir en tant que mandataire administratif, notamment pour communiquer avec les universités, soumettre les candidatures et gérer une adresse e-mail partagée. Certaines étapes restent strictement personnelles et doivent être effectuées directement par le Client.\n\nLe Prestataire s'interdit d'utiliser l'adresse e-mail partagée à d'autres fins que celles du présent contrat.",
  },
  {
    title: "3. Responsabilités du Client",
    content:
      "Le Client s'engage à fournir des documents authentiques, exacts et complets, à respecter les délais et à participer aux procédures obligatoires. Le Prestataire n'est pas responsable en cas de documents falsifiés ou d'informations incorrectes.",
  },
  {
    title: "4. Limitation des interventions",
    content:
      "JEEXPERT STUDY n'effectue aucun test, entretien ou procédure officielle à la place du Client. Le rôle du Prestataire est d'accompagner, conseiller et préparer le Client.",
  },
  {
    title: "5. Vérification du dossier",
    content:
      "JEEXPERT STUDY accompagne le Client dans la préparation et l'optimisation complète de son dossier, en veillant à sa cohérence, sa qualité et sa conformité avec les exigences des universités.\n\nNous maximisons les chances d'admission et de bourse. Toutefois, les décisions finales restant à la discrétion des institutions (universités, organismes de bourse, autorités consulaires).",
  },
  {
    title: "6. Prestations et conditions financières",
    content:
      "Le Client sélectionne la formule souhaitée parmi les options disponibles :\n\n• Acompte – Frais d'accompagnement administratif (Admission)\n• Frais d'acceptation – Clôture du service administratif (Admission)\n• Acompte - Frais Administratif Dossier Bourse\n• Frais Clôture Bourse si Obtenu\n\nConditions de paiement : Le paiement de l'acompte permet de démarrer les prestations. Il est non remboursable. Les frais complémentaires deviennent exigibles selon la formule choisie et l'avancement du dossier. En cas de non-paiement, le Prestataire se réserve le droit de suspendre ou arrêter les services.",
  },
  {
    title: "7. Résultats et réengagement",
    content:
      "En cas de non-admission, le Client peut bénéficier d'un nouvel accompagnement pour une prochaine rentrée sans repayer les frais de service (hors frais externes).",
  },
  {
    title: "8. Protection des données",
    content:
      "Les données du Client sont traitées conformément au RGPD et peuvent être supprimées en cas d'inactivité.",
  },
  {
    title: "9. Durée et résiliation",
    content:
      "Le contrat prend effet à la signature et peut être résilié en cas de non-respect des engagements ou de non-paiement.",
  },
  {
    title: "10. Acceptation",
    content:
      "Le Client reconnaît avoir lu et accepté les conditions du présent contrat. En cliquant sur le bouton ci-dessous, vous confirmez votre accord avec l'ensemble des termes et conditions.",
  },
]

export default function StudentContract() {
  const { studentInfo, setStudentInfo } = useStudentPortal()
  const [loading, setLoading] = useState(false)
  const [justAccepted, setJustAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const alreadySigned = studentInfo.contratSigned === true
  const signed = alreadySigned || justAccepted

  const handleAccept = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/sign-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: studentInfo.folderId,
          email: studentInfo.email,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.")
        return
      }
      setStudentInfo({ ...studentInfo, contratSigned: true })
      setJustAccepted(true)
    } catch {
      setError("Une erreur réseau est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--jx-terracotta)]/10">
          <FileText className="h-5 w-5 text-[var(--jx-terracotta)]" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-zinc-900">Contrat de prestation de services</h2>
          <p className="text-xs text-zinc-500">JEEXPERT STUDY — Veuillez lire attentivement avant d'accepter</p>
        </div>
        {signed && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle className="h-3.5 w-3.5" />
            Signé
          </span>
        )}
      </div>

      {/* Contract card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {/* Contract header banner */}
        <div className="border-b border-zinc-200 bg-[var(--jx-night)] px-6 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--jx-terracotta)]">JEEXPERT</p>
          <p className="text-sm font-semibold">CONTRAT DE PRESTATION DE SERVICES</p>
          <p className="mt-1 text-xs text-white/60">Client : {studentInfo.name} {studentInfo.surname ?? ""}</p>
        </div>

        {/* Sections */}
        <div className="divide-y divide-zinc-100">
          {CONTRACT_SECTIONS.map((section) => (
            <div key={section.title} className="px-6 py-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--jx-terracotta)]">
                {section.title}
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">{section.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accept / signed section */}
      {signed ? (
        <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Contrat signé</p>
            <p className="text-xs text-green-600">
              Vous avez déjà accepté ce contrat. Aucune action supplémentaire n'est requise.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-zinc-600">
            En cliquant sur <strong>J'accepte le contrat</strong>, vous confirmez avoir lu et accepté l'intégralité des
            conditions du présent contrat de prestation de services JEEXPERT.
          </p>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-[var(--jx-terracotta)] text-white hover:bg-[var(--jx-terracotta)]/90 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              "J'accepte le contrat"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
