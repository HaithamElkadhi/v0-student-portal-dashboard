import { LockKeyhole, MessageCircle } from "lucide-react"

export default function StudentStageLocked({ title }: { title: string }) {
  return <section className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500"><LockKeyhole className="h-5 w-5" aria-hidden /></div>
    <h1 className="mt-4 text-xl font-semibold text-zinc-900">{title}</h1>
    <p className="mt-2 text-sm text-zinc-500">Contactez votre conseiller pour débloquer cette étape.</p>
    <a href="https://wa.me/393520880880" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"><MessageCircle className="h-4 w-4" aria-hidden />Contacter mon conseiller</a>
  </section>
}
