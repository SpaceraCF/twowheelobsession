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
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: {
    default: "Two Wheel Obsession — Yamaha, Suzuki, CFMOTO motorcycles",
    template: "%s | Two Wheel Obsession",
  },
  description:
    "Motorcycle dealership on the NSW Central Coast. New & used Yamaha, Suzuki and CFMOTO motorcycles, parts, accessories and full workshop service.",
  icons: {
    icon: [
      { url: "/two-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/two-favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/two-favicon-180.png", sizes: "180x180" },
  },
  openGraph: {
    title: "Two Wheel Obsession — Motorcycle dealer on the NSW Central Coast",
    description:
      "Yamaha · Suzuki · CFMOTO. New bikes, used bikes, service & repairs.",
    type: "website",
    locale: "en_AU",
    siteName: "Two Wheel Obsession",
    images: [
      { url: "/hero/mt-darkside.jpg", width: 1920, height: 600, alt: "Two Wheel Obsession — Yamaha, Suzuki, CFMOTO" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Two Wheel Obsession",
    description: "Motorcycle dealer on the NSW Central Coast.",
    images: ["/hero/mt-darkside.jpg"],
  },
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
