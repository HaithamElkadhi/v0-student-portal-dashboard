"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import StudentAppInstall from "@/components/student-app-install"
import { LifeBuoy } from "lucide-react"
import {
  LogOut,
  User,
  House,
  Menu,
  X,
  RefreshCw,
  CalendarDays,
  ChevronDown,
  Headset,
  BookOpen,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStudentPortal } from "@/components/student-portal-context"

const HOME = "/student_italy"
const PROFILE = "/student_italy/profil"
const PAYMENT = "/student_italy/paiement"
const ADMISSION = "/student_italy/admission-provisoire"
const VISA = "/student_italy/visa"
const SCHOLARSHIP = "/student_italy/bourse"
const INTEGRATION = "/student_italy/integration"
const SUPPORT = "/student_italy/support"
const REGLEMENT = "/student_italy/reglement"
const BOOKING = "/student_italy/rendez-vous"
const GUIDE = "/student_italy/guide"
const COURSES = "/student_italy/courses"

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
  const isBooking = pathname === BOOKING
  const isGuide = pathname === GUIDE || pathname?.startsWith(GUIDE + "/")

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
  const isAdmission = pathname === ADMISSION || pathname?.startsWith(`${ADMISSION}/`) || pathname === "/student_italy/admission" || pathname?.startsWith("/student_italy/admission/")
  const isVisa = pathname === VISA || pathname?.startsWith(`${VISA}/`)
  const isScholarship = pathname === SCHOLARSHIP || pathname?.startsWith(`${SCHOLARSHIP}/`)
  const isIntegration = pathname === INTEGRATION || pathname?.startsWith(`${INTEGRATION}/`)
  const isReglement = pathname === REGLEMENT || pathname?.startsWith(`${REGLEMENT}/`)

  const navItemBase =
    "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B65]"
  const navItemIdle = "text-[#173B65] hover:bg-[#EDF7FD]"
  const navItemActive = "bg-[#DCF2FC] font-semibold text-[#092C51]"
  const navIconClass = "size-5 shrink-0"

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
      (href === SUPPORT && isSupport) ||
      (href === BOOKING && isBooking) ||
      (href === GUIDE && isGuide) ||
      (href === COURSES && isCourses) ||
      (href === REGLEMENT && isReglement) ||
      false
    return (
      <Link
        href={href}
        onClick={closeMenu}
        aria-current={active ? "page" : undefined}
        className={cn(navItemBase, active ? navItemActive : navItemIdle)}
        prefetch
      >
        {icon}
        {label}
      </Link>
    )
  }

  const isSupport = pathname === SUPPORT
  const isCourses = pathname === COURSES
  const isDocuments = pathname === "/student_italy/documents" || pathname?.startsWith("/student_italy/documents/")
  const isOrientation = pathname === "/student_italy/orientation" || pathname?.startsWith("/student_italy/orientation/")
  const label = isCourses ? "Courses" : isGuide ? "Guide des démarches" : isBooking ? "Rendez-vous" : isOrientation ? "Orientation" : isDocuments ? "Documents" : isSupport ? "Support" : isHome ? "Accueil" : isProfile ? "Profil" : pageLabel(isPayment, isAdmission, isVisa, isScholarship, isIntegration, isReglement)
  const firstName = studentInfo.name.trim().split(/\s+/)[0] || "Mon profil"
  const initials = (firstName[0] + (studentInfo.surname?.[0] || "")).toUpperCase()
  const photo = Array.isArray(studentInfo.photo) ? studentInfo.photo[0]?.url : typeof studentInfo.photo === "string" ? studentInfo.photo : null
  const profileMenuItem = "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none data-[highlighted]:bg-[#E8F4FB] data-[disabled]:opacity-50"

  return (
    <div className="min-h-screen bg-[#EAF5FC] font-sans antialiased text-[#172D43]">
      <div className="flex min-h-screen flex-col md:flex-row md:items-stretch">
        <aside
          id="portal-sidebar"
          className={cn(
            "fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex w-full flex-col overflow-y-auto bg-white transition-opacity duration-200 ease-out md:sticky md:bottom-auto md:z-0 md:h-dvh md:w-52 md:shrink-0 md:border-r md:border-[#BCD6EC] xl:w-[15.5rem]",
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

          <div className="px-6 pb-3 pt-2">
            <img src="/brand/jeexpert-logo.png" alt="JEEXPERT" width={1280} height={1280} className="mx-auto size-32 object-contain" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Portail étudiant</p>
          </div>

          <nav className="space-y-1 px-3 py-2" aria-label="Sections">
            <NavLink href={HOME} icon={<House className={navIconClass} aria-hidden />}>Accueil</NavLink>
            <NavLink href={COURSES} icon={<GraduationCap className={navIconClass} aria-hidden />}>Courses</NavLink>
            <NavLink href={GUIDE} icon={<BookOpen className={navIconClass} aria-hidden />}>Guide des démarches</NavLink>
            <div className="md:hidden"><NavLink href={BOOKING} icon={<CalendarDays className={navIconClass} aria-hidden />}>Réserver un rendez-vous</NavLink></div>
            <NavLink href={SUPPORT} icon={<LifeBuoy className={navIconClass} aria-hidden />}>
              Support
            </NavLink>
          </nav>

          <div className="mx-4 mt-auto shrink-0 space-y-3 border-t border-slate-100 py-4">
            <Link href={SUPPORT} onClick={closeMenu} className="flex min-h-11 items-start gap-3 rounded-lg px-2 py-1 text-[#173B65] hover:bg-[#EDF7FD] focus-visible:outline-2 focus-visible:outline-[#173B65]">
              <Headset className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span><span className="block text-sm font-semibold">Une question ?</span><span className="block text-xs text-slate-600">Contactez notre support</span></span>
            </Link>
            <StudentAppInstall />

          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#D5E6F3] bg-white px-3 sm:px-5 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#D5E6F3] text-[#173B65] hover:bg-[#EDF7FD] focus-visible:outline-2 focus-visible:outline-[#173B65] md:hidden"
              aria-expanded={menuOpen}
              aria-controls="portal-sidebar"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3 text-sm sm:text-base">
              <Link href={HOME} className="hidden shrink-0 text-slate-600 hover:text-[#173B65] focus-visible:outline-2 focus-visible:outline-[#173B65] sm:inline">Espace étudiant</Link>
              <span className="hidden text-slate-400 sm:inline" aria-hidden="true">/</span>
              <span className="truncate font-semibold text-[#092C51]">{label}</span>
            </div>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full p-1.5 text-[#092C51] hover:bg-[#EDF7FD] focus-visible:outline-2 focus-visible:outline-[#173B65] sm:gap-3" aria-label="Ouvrir le menu de mon compte">
                <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#BDEAF9] text-sm font-semibold text-[#092C51] sm:size-10">
                  {photo ? <img src={photo} alt="" className="size-full object-cover" /> : initials}
                </span>
                <span className="hidden max-w-36 truncate text-sm font-semibold sm:block">{firstName}</span>
                <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} collisionPadding={12} className="z-50 w-52 rounded-xl border border-[#D5E6F3] bg-white p-1.5 text-[#173B65] shadow-lg">
                  <DropdownMenu.Item asChild className={profileMenuItem}><Link href={PROFILE}><User className="size-4" aria-hidden="true" />Mon profil</Link></DropdownMenu.Item>
                  <DropdownMenu.Item className={profileMenuItem} disabled={isRefreshing} onSelect={() => void reloadFromApi()}><RefreshCw className="size-4" aria-hidden="true" />Actualiser</DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Item className={profileMenuItem + " text-red-700"} onSelect={onLogout}><LogOut className="size-4" aria-hidden="true" />Se déconnecter</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </header>

          <div className="flex w-full min-w-0 flex-1 flex-col px-3 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-5 md:py-6 lg:px-8 xl:py-8">
            <div className="w-full max-w-none">{children}</div>
          </div>
        </div>
      </div>
      <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-zinc-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <Link href={HOME} onClick={closeMenu} aria-current={isHome && !menuOpen ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium", isHome && !menuOpen ? "text-[var(--jx-terracotta)]" : "text-zinc-500")}><House className="h-5 w-5" />Accueil</Link>
        <button type="button" aria-expanded={menuOpen} aria-controls="portal-sidebar" onClick={() => setMenuOpen(value => !value)} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium", menuOpen ? "text-[var(--jx-terracotta)]" : "text-zinc-500")}><Menu className="h-5 w-5" />Menu</button>
        <Link href={BOOKING} onClick={closeMenu} aria-current={isBooking && !menuOpen ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium", isBooking && !menuOpen ? "text-[var(--jx-terracotta)]" : "text-zinc-500")}><CalendarDays className="h-5 w-5" />Rendez-vous</Link>
        <Link href={SUPPORT} onClick={closeMenu} aria-current={isSupport && !menuOpen ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium", isSupport && !menuOpen ? "text-[var(--jx-terracotta)]" : "text-zinc-500")}><LifeBuoy className="h-5 w-5" />Support</Link>
      </nav>
    </div>
  )
}
