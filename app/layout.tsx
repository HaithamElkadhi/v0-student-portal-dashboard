import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // <CHANGE> Updated metadata for JEEXPERT student portal
  title: "JEEXPERT Portail Étudiant",
  description: "Suivez votre parcours d'admission, visa, bourse et intégration",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "JEEXPERT", statusBarStyle: "default" },
  icons: {
    icon: [
      {
        url: "/Jeexpert Logo base.png",
        type: "image/png",
      },
    ],
    apple: "/icons/pwa-192.png",
  },
}

export const viewport: Viewport = { themeColor: "#ffffff" }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
