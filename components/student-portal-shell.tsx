"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import StudentAppInstall from "@/components/student-app-install"
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
const SUPPORT = "/student_italy/support"
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
    "relative flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-center text-sm font-medium shadow-sm md:border-0 md:shadow-none md:min-h-0 md:flex-row md:justify-start md:gap-2.5 md:rounded-lg md:py-2 md:pl-2.5 md:pr-2 md:text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jx-terracotta)]/25"
  const navItemIdle = "text-zinc-700 hover:bg-zinc-100"
  const navItemActive =
    "bg-zinc-100 font-semibold text-[var(--jx-night)] before:absolute before:bottom-1 before:left-1/2 before:h-0.5 before:w-7 before:-translate-x-1/2 md:before:bottom-auto md:before:left-0 md:before:top-1/2 md:before:h-7 md:before:w-0.5 md:before:translate-x-0 md:before:-translate-y-1/2 before:rounded-full before:bg-[var(--jx-terracotta)]"
  const navIconClass = "h-7 w-7 shrink-0 text-[var(--jx-terracotta)] md:h-[18px] md:w-[18px] md:text-zinc-500"

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

  const isSupport = pathname === SUPPORT
  const label = isSupport ? "Support" : isHome ? "Accueil" : isProfile ? "Profil" : pageLabel(isPayment, isAdmission, isVisa, isScholarship, isIntegration, isReglement)

  return (
    <div className="min-h-screen scroll-smooth bg-zinc-100 font-sans antialiased text-zinc-900">
      <div className="flex min-h-screen flex-col md:flex-row md:items-stretch">
        <aside
          id="portal-sidebar"
          className={cn(
            "fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex w-full flex-col overflow-y-auto bg-zinc-50 transition-opacity duration-200 ease-out md:sticky md:left-auto md:top-0 md:max-h-none md:rounded-none md:border-0 md:border-r md:translate-y-0 md:z-0 md:h-screen md:w-[14rem] md:max-w-none md:translate-x-0 md:shadow-none",
            menuOpen ? "visible opacity-100" : "invisible opacity-0 md:visible md:opacity-100",
          )}
          aria-label="Menu de navigation"
        >
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-100 px-3 md:hidden">
            <span className="text-sm font-semibold text-zinc-800">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
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
                <p className="truncate text-xs text-zinc-500"><span className="md:hidden">{studentInfo.name}</span><span className="hidden md:inline">Portail étudiant</span></p>
              </div>
            </div>
          </div>

          <nav className="grid shrink-0 grid-cols-2 content-start gap-3 p-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:flex md:flex-col md:gap-0.5 md:px-2 md:py-2" aria-label="Sections">
            <p className="col-span-2 mb-1 px-2 text-center text-[10px] font-semibold md:text-left uppercase tracking-wider text-zinc-400">Menu</p>
            <div className="hidden md:block"><NavLink href={HOME} icon={<House className={navIconClass} aria-hidden />}>Accueil</NavLink></div>
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
              <Link href={PROFILE} onClick={closeMenu} aria-label="Mon profil" title="Mon profil" aria-current={isProfile ? "page" : undefined} className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jx-terracotta)]/30", isProfile ? "border-[var(--jx-terracotta)] bg-[var(--jx-terracotta)]/10 text-[var(--jx-terracotta)]" : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}>
                <User className="h-4 w-4" aria-hidden />
              </Link>
              <div className="flex min-w-0 max-w-[5.5rem] items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-1 sm:max-w-[11rem] sm:gap-1.5 sm:px-2">
                <FolderOpen className="h-3 w-3 shrink-0 text-zinc-500 sm:h-3.5 sm:w-3.5" aria-hidden />
                <span className="truncate font-mono text-[10px] font-semibold text-zinc-800 sm:text-[11px]">
                  {studentInfo.folderId || "—"}
                </span>
              </div>

              <Button asChild variant="outline" size="sm" title="Support" className="h-8 gap-1.5 rounded-md border-zinc-200 bg-white px-2 text-xs text-zinc-700 hover:bg-zinc-50 sm:px-2.5">
                <Link href={SUPPORT} onClick={closeMenu}><LifeBuoy className="h-3.5 w-3.5" /><span className="hidden sm:inline">Support</span></Link>
              </Button>

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

          <div className="flex w-full min-w-0 flex-1 flex-col px-3 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-5 md:py-5">
            <div className="w-full max-w-none">{children}</div>
          </div>
        </div>
      </div>
      <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-zinc-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <Link href={HOME} onClick={closeMenu} aria-current={isHome && !menuOpen ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium", isHome && !menuOpen ? "text-[var(--jx-terracotta)]" : "text-zinc-500")}><House className="h-5 w-5" />Accueil</Link>
        <button type="button" aria-expanded={menuOpen} aria-controls="portal-sidebar" onClick={() => setMenuOpen(value => !value)} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium", menuOpen ? "text-[var(--jx-terracotta)]" : "text-zinc-500")}><Menu className="h-5 w-5" />Menu</button>
        <Link href={SUPPORT} onClick={closeMenu} aria-current={isSupport && !menuOpen ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium", isSupport && !menuOpen ? "text-[var(--jx-terracotta)]" : "text-zinc-500")}><LifeBuoy className="h-5 w-5" />Support</Link>
      </nav>
    </div>
  )
}
