import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { CartDrawer } from "@/components/CartDrawer"
import { JsonLd } from "@/components/JsonLd"
import { PartsSiteFooter } from "@/components/PartsSiteFooter"
import { PartsSiteHeader } from "@/components/PartsSiteHeader"
import { CartProvider } from "@/lib/cart/CartContext"
import { partsStoreJsonLd, websiteJsonLd } from "@/lib/seo/jsonld"

import "../(frontend)/globals.css"

// Root layout for the Yamaha Parts Australia subsite. Served at
// yamahapartsaustralia.com.au — the parts-only spinout. Reuses the same
// EPC widget and Payload backend as the main twowheelobsession.com.au
// site, but with its own brand identity (deep navy + parts-focused
// nav). See `proxy.ts` for the host-based rewrite that maps the parts
// domain to /parts/* internally.
//
// This is a separate root layout (sibling to (frontend) and (payload)
// route groups), so it owns its own <html>/<body> and metadata.

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://yamahapartsaustralia.com.au"),
  title: {
    default: "Yamaha Parts Australia — Genuine OEM parts & accessories",
    template: "%s | Yamaha Parts Australia",
  },
  description:
    "Order genuine Yamaha OEM parts and accessories from Two Wheel Obsession. Look up any Yamaha part by model with the EPC parts catalogue. Authorised dealer on the NSW Central Coast.",
  openGraph: {
    title: "Yamaha Parts Australia — Genuine OEM parts & accessories",
    description:
      "Look up any Yamaha part by model. Authorised Yamaha dealer with flat-rate Australia-wide shipping.",
    type: "website",
    locale: "en_AU",
    siteName: "Yamaha Parts Australia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yamaha Parts Australia",
    description: "Genuine Yamaha OEM parts. Australia-wide shipping.",
  },
  // Different favicon set could go here once supplied; for now the
  // shared TWO favicons are fine.
  icons: {
    icon: [
      { url: "/two-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/two-favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/two-favicon-180.png", sizes: "180x180" },
  },
}

export default function PartsSiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-zinc-900 antialiased">
        <JsonLd data={partsStoreJsonLd()} />
        <JsonLd
          data={websiteJsonLd({
            url: "https://yamahapartsaustralia.com.au",
            name: "Yamaha Parts Australia",
          })}
        />
        <CartProvider>
          <PartsSiteHeader />
          <main className="flex-1">{children}</main>
          <PartsSiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
