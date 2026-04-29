import type { Metadata } from "next"
import { Inter, Bebas_Neue } from "next/font/google"

import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Two Wheel Obsession — Yamaha, Suzuki, CFMOTO motorcycles",
  description:
    "Motorcycle dealership on the NSW Central Coast. New & used Yamaha, Suzuki and CFMOTO motorcycles, parts, accessories and full workshop service.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col bg-[--color-bg] text-[--color-ink]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
