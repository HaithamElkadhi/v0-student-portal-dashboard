import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // <CHANGE> Updated metadata for JEEXPERT student portal
  title: "JEEXPERT Student Portal",
  description: "Track your admission, visa, scholarship, and integration journey",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/Jeexpert Logo base.png",
        type: "image/png",
      },
    ],
    apple: "/Jeexpert Logo base.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
