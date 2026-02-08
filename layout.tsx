import React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { FinancialProvider } from "@/lib/financial-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  title: "Chronowealth | Financial Digital Twin",
  description:
    "Hyper-luxury financial operating system. Your personal financial digital twin.",
}

export const viewport: Viewport = {
  themeColor: "#050505",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased min-h-screen ${spaceGrotesk.variable}`}>
        <FinancialProvider>
          {children}
          <div className="noise-overlay" aria-hidden="true" />
          <Toaster />
        </FinancialProvider>
      </body>
    </html>
  )
}
