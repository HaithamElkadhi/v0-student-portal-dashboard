"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import StudentAppInstall from "@/components/student-app-install"
import StudentTicketForm from "@/components/student-ticket-form"
import { LifeBuoy } from "lucide-react"
import {
  LogOut,
  FolderOpen,
  User,
  House,
  CreditCard,
  ClipboardList,
  Plane,
  GraduationCap,
  Globe,
  Menu,
  X,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStudentPortal } from "@/components/student-portal-context"

const HOME = "/student_italy"
const PROFILE = "/student_italy/profil"
const PAYMENT = "/student_italy/paiement"
const ADMISSION = "/student_italy/admission"
const VISA = "/student_italy/visa"
const SCHOLARSHIP = "/student_italy/bourse"
const INTEGRATION = "/student_italy/integration"
const REGLEMENT = "/student_italy/reglement"

function pageLabel(
  isPayment: boolean,
  isAdmission: boolean,
  isVisa: boolean,
  isScholarship: boolean,
  isIntegration: boolean,
  isReglement: boolean,
): string {
  if (isPayment) return "Paiements"
  if (isAdmission) return "Admission"
  if (isVisa) return "Visa"
  if (isScholarship) return "Bourse"
  if (isIntegration) return "Intégration"
  if (isReglement) return "Règlement"
  return "Profil"
}

export function StudentPortalShell({ children }: { children: ReactNode }) {
  const { studentInfo, onLogout, reloadFromApi, isRefreshing } = useStudentPortal()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const isHome = pathname === HOME || pathname === `${HOME}/`
  const isProfile = pathname === PROFILE || pathname?.startsWith(PROFILE + "/")
  const isPayment = pathname === PAYMENT || pathname?.startsWith(`${PAYMENT}/`)
  const isAdmission = pathname === ADMISSION || pathname?.startsWith(`${ADMISSION}/`)
  const isVisa = pathname === VISA || pathname?.startsWith(`${VISA}/`)
  const isScholarship = pathname === SCHOLARSHIP || pathname?.startsWith(`${SCHOLARSHIP}/`)
  const isIntegration = pathname === INTEGRATION || pathname?.startsWith(`${INTEGRATION}/`)
  const isReglement = pathname === REGLEMENT || pathname?.startsWith(`${REGLEMENT}/`)

  const navItemBase =
    "relative flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl p-3 text-center text-sm font-medium md:min-h-0 md:flex-row md:justify-start md:gap-2.5 md:rounded-lg md:py-2 md:pl-2.5 md:pr-2 md:text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jx-terracotta)]/25"
  const navItemIdle = "text-zinc-700 hover:bg-zinc-100"
  const navItemActive =
    "bg-zinc-100 font-semibold text-[var(--jx-night)] before:absolute before:bottom-1 before:left-1/2 before:h-0.5 before:w-7 before:-translate-x-1/2 md:before:bottom-auto md:before:left-0 md:before:top-1/2 md:before:h-7 md:before:w-0.5 md:before:translate-x-0 md:before:-translate-y-1/2 before:rounded-full before:bg-[var(--jx-terracotta)]"
  const navIconClass = "h-[18px] w-[18px] shrink-0 text-zinc-500"

  const NavLink = ({
    href,
    children: label,
    icon,
  }: {
    href: string
    children: ReactNode
    icon: ReactNode
  }) => {
    const active =
      (href === HOME && isHome && !href.includes("#")) ||
      (href === PROFILE && isProfile) ||
      (href === PAYMENT && isPayment) ||
      (href === ADMISSION && isAdmission) ||
      (href === VISA && isVisa) ||
      (href === SCHOLARSHIP && isScholarship) ||
      (href === INTEGRATION && isIntegration) ||
      (href === REGLEMENT && isReglement) ||
      false
    return (
      <Link
        href={href}
        onClick={closeMenu}
        className={cn(navItemBase, active ? navItemActive : navItemIdle)}
        prefetch
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:h-8 md:w-8 md:rounded-md bg-zinc-200/60 text-zinc-600">
          {icon}
        </span>
        {label}
      </Link>
    )
  }

  const label = isHome ? "Accueil" : isProfile ? "Profil" : pageLabel(isPayment, isAdmission, isVisa, isScholarship, isIntegration, isReglement)

  return (
    <div className="min-h-screen scroll-smooth bg-zinc-100 font-sans antialiased text-zinc-900">
      <button
        type="button"
        aria-label="Fermer le menu"
        className={cn(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity md:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMenu}
      />

      <div className="flex min-h-screen flex-col md:flex-row md:items-stretch">
        <aside
          id="portal-sidebar"
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition-[opacity,transform] duration-200 ease-out md:sticky md:left-auto md:top-0 md:max-h-none md:rounded-none md:border-0 md:border-r md:translate-y-0 md:z-0 md:h-screen md:w-[14rem] md:max-w-none md:translate-x-0 md:shadow-none",
            menuOpen ? "scale-100 opacity-100 shadow-2xl md:translate-x-0" : "pointer-events-none scale-95 opacity-0 md:pointer-events-auto md:scale-100 md:translate-x-0 md:opacity-100",
          )}
          aria-label="Menu de navigation"
        >
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-100 px-3 md:hidden">
            <span className="text-sm font-semibold text-zinc-800">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-zinc-100 px-3 py-3">
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <img
                src="/Jeexpert Logo base.png"
                alt="JEEXPERT"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-lg object-contain"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--jx-terracotta)]">JEEXPERT</p>
                <p className="truncate text-xs text-zinc-500">Portail étudiant</p>
              </div>
            </div>
          </div>

          <nav className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto p-3 md:flex md:flex-col md:gap-0.5 md:px-2 md:py-2" aria-label="Sections">
            <p className="col-span-2 mb-1 px-2 text-center text-[10px] font-semibold md:text-left uppercase tracking-wider text-zinc-400">Menu</p>
            <NavLink href={HOME} icon={<House className={navIconClass} aria-hidden />}>Accueil</NavLink>
            <NavLink href={PROFILE} icon={<User className={navIconClass} aria-hidden />}>
              Profil
            </NavLink>
            <NavLink href={PAYMENT} icon={<CreditCard className={navIconClass} aria-hidden />}>
              Paiement
            </NavLink>
            <NavLink href={ADMISSION} icon={<ClipboardList className={navIconClass} aria-hidden />}>
              Admission
            </NavLink>
            <NavLink href={VISA} icon={<Plane className={navIconClass} aria-hidden />}>
              Visa
            </NavLink>
            <NavLink href={SCHOLARSHIP} icon={<GraduationCap className={navIconClass} aria-hidden />}>
              Bourse
            </NavLink>
            <NavLink href={INTEGRATION} icon={<Globe className={navIconClass} aria-hidden />}>
              Intégration
            </NavLink>
</nav>

          <div className="mt-auto shrink-0 space-y-2 border-t border-zinc-100 p-2">
            <StudentAppInstall />
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50 px-2.5 py-2 text-center md:text-left">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Dossier</p>
              <p className="truncate font-mono text-xs font-semibold text-zinc-800">{studentInfo.folderId || "—"}</p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-zinc-200/90 bg-white/90 px-3 backdrop-blur-md sm:px-4">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 shadow-sm hover:border-zinc-300 hover:text-zinc-900 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="portal-sidebar"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Un seul logo dans l’app : la sidebar. Ici, titre texte uniquement (mobile + desktop). */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{label}</p>
              <p className="truncate text-xs text-zinc-500">{studentInfo.name}</p>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-1.5">
              <div className="flex min-w-0 max-w-[5.5rem] items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-1 sm:max-w-[11rem] sm:gap-1.5 sm:px-2">
                <FolderOpen className="h-3 w-3 shrink-0 text-zinc-500 sm:h-3.5 sm:w-3.5" aria-hidden />
                <span className="truncate font-mono text-[10px] font-semibold text-zinc-800 sm:text-[11px]">
                  {studentInfo.folderId || "—"}
                </span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" title="Ticket support" className="h-8 gap-1.5 rounded-md border-zinc-200 bg-white px-2 text-xs text-zinc-700 hover:bg-zinc-50 sm:px-2.5">
                    <LifeBuoy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Ticket support</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border-zinc-200 bg-white p-5 sm:p-6">
                  <DialogTitle className="sr-only">Ticket support</DialogTitle>
                  <DialogDescription className="sr-only">Envoyez une demande à notre équipe avec vos pièces jointes.</DialogDescription>
                  <StudentTicketForm />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void reloadFromApi()}
                disabled={isRefreshing}
                title="Actualiser"
                className="h-8 w-8 shrink-0 rounded-md border-zinc-200 bg-white p-0 text-zinc-600 hover:bg-zinc-50 sm:w-auto sm:px-2.5"
              >
                <RefreshCw className={`mx-auto h-3.5 w-3.5 sm:mx-0 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:ml-1.5 sm:inline sm:text-xs">Actualiser</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                title="Déconnexion"
                className="h-8 gap-1 rounded-md border-zinc-200 bg-white px-2 text-xs text-zinc-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:px-2.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sortir</span>
              </Button>
            </div>
          </header>

          <div className="flex w-full min-w-0 flex-1 flex-col px-3 py-4 sm:px-5 sm:py-5">
            <div className="w-full max-w-none">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
