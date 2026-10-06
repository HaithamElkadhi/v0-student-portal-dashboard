"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export default function StudentAppInstall() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(false)
  const [help, setHelp] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)")
    const update = () => setInstalled(media.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone)
    update()
    media.addEventListener("change", update)
    const available = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt) }
    const done = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener("beforeinstallprompt", available)
    window.addEventListener("appinstalled", done)
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => console.error("Installation service worker unavailable"))
    }
    return () => {
      media.removeEventListener("change", update)
      window.removeEventListener("beforeinstallprompt", available)
      window.removeEventListener("appinstalled", done)
    }
  }, [])
  if (installed) return null
  return <>
    <Button variant="outline" className="min-h-11 w-full gap-2 rounded-xl text-sm" onClick={async () => {
      if (!prompt) { setHelp(true); return }
      try { await prompt.prompt(); await prompt.userChoice; setPrompt(null) } catch { setPrompt(null); setHelp(true) }
    }}><Download className="h-4 w-4" />Installer l’application</Button>
    <Dialog open={help} onOpenChange={setHelp}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
        <DialogTitle>Installer JEEXPERT</DialogTitle>
        <DialogDescription>Retrouvez votre portail directement sur l’écran d’accueil de votre téléphone.</DialogDescription>
        <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
          <p><strong className="text-zinc-900">Android :</strong> ouvrez le portail dans Chrome, puis dans le menu ⋮ choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».</p>
          <p><strong className="text-zinc-900">iPhone :</strong> ouvrez le portail dans Safari, touchez Partager, puis « Sur l’écran d’accueil » et « Ajouter ».</p>
          <p><strong className="text-zinc-900">Ordinateur :</strong> dans Chrome ou Edge, utilisez l’icône d’installation dans la barre d’adresse.</p>
        </div>
      </DialogContent>
    </Dialog>
  </>
}
