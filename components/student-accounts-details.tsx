"use client"
type Account = { id: string; username: string; labels: string[] }
export type StudentAccountsData = { applicationEmail: string; accounts: Account[] }
export default function StudentAccountsDetails({ data, error }: { data: StudentAccountsData | null; error: boolean }) {
  if (error) return <p role="alert" className="text-sm text-red-700">Impossible de charger vos comptes. Fermez puis actualisez la page pour réessayer.</p>
  if (!data) return <p role="status" className="text-sm text-zinc-500">Chargement des comptes…</p>
  return <div className="space-y-4"><div className="rounded-xl border border-zinc-200 p-4"><h3 className="text-xs font-medium text-zinc-500">Mail de candidature</h3><p className="mt-1 break-all text-sm font-semibold text-zinc-900">{data.applicationEmail || "Pas encore renseigné"}</p></div><h3 className="text-sm font-semibold text-zinc-900">Comptes créés à votre nom</h3>{data.accounts.length ? <ul className="space-y-3">{data.accounts.map(account => <li key={account.id} className="rounded-xl border border-zinc-200 p-4"><div className="mb-2 flex flex-wrap gap-2">{account.labels.map(label => <span key={label} className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">{label}</span>)}</div><p className="break-all text-sm text-zinc-900">{account.username || "Identifiant non renseigné"}</p></li>)}</ul> : <p className="text-sm text-zinc-500">Aucun compte créé n’est encore enregistré dans votre dossier.</p>}</div>
}
