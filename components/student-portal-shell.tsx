"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  FolderOpen,
  User,
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
const PAYMENT = "/student_italy/paiement"
const ADMISSION = "/student_italy/admission"
const VISA = "/student_italy/visa"
const SCHOLARSHIP = "/student_italy/bourse"
const INTEGRATION = "/student_italy/integration"

function pageLabel(
  isPayment: boolean,
  isAdmission: boolean,
  isVisa: boolean,
  isScholarship: boolean,
  isIntegration: boolean,
): string {
  if (isPayment) return "Paiements"
  if (isAdmission) return "Admission"
  if (isVisa) return "Visa"
  if (isScholarship) return "Bourse"
  if (isIntegration) return "Intégration"
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
  const isPayment = pathname === PAYMENT || pathname?.startsWith(`${PAYMENT}/`)
  const isAdmission = pathname === ADMISSION || pathname?.startsWith(`${ADMISSION}/`)
  const isVisa = pathname === VISA || pathname?.startsWith(`${VISA}/`)
  const isScholarship = pathname === SCHOLARSHIP || pathname?.startsWith(`${SCHOLARSHIP}/`)
  const isIntegration = pathname === INTEGRATION || pathname?.startsWith(`${INTEGRATION}/`)

  const navItemBase =
    "relative flex w-full items-center gap-2.5 rounded-lg py-2 pl-2.5 pr-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jx-terracotta)]/25"
  const navItemIdle = "text-zinc-700 hover:bg-zinc-100"
  const navItemActive =
    "bg-zinc-100 font-semibold text-[var(--jx-night)] before:absolute before:left-0 before:top-1/2 before:h-7 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[var(--jx-terracotta)]"
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
      (href === PAYMENT && isPayment) ||
      (href === ADMISSION && isAdmission) ||
      (href === VISA && isVisa) ||
      (href === SCHOLARSHIP && isScholarship) ||
      (href === INTEGRATION && isIntegration) ||
      false
    return (
      <Link
        href={href}
        onClick={closeMenu}
        className={cn(navItemBase, active ? navItemActive : navItemIdle)}
        prefetch
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-200/60 text-zinc-600">
          {icon}
        </span>
        {label}
      </Link>
    )
  }

  const label = pageLabel(isPayment, isAdmission, isVisa, isScholarship, isIntegration)

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
            "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,248px)] max-w-[calc(100vw-2rem)] flex-col border-r border-zinc-200/80 bg-white transition-transform duration-200 ease-out md:sticky md:top-0 md:z-0 md:h-screen md:w-[14rem] md:max-w-none md:translate-x-0 md:shadow-none",
            menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
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
            <div className="flex items-center gap-2.5">
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

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2" aria-label="Sections">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Menu</p>
            <NavLink href={HOME} icon={<User className={navIconClass} aria-hidden />}>
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

          <div className="mt-auto shrink-0 border-t border-zinc-100 p-2">
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50 px-2.5 py-2">
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
