import type { Metadata } from "next"
import Link from "next/link"
import { Inter } from "next/font/google"

import { SiteFooter } from "@/components/SiteFooter"
import { SiteHeader } from "@/components/SiteHeader"

import "./(frontend)/globals.css"

// `global-not-found.tsx` handles unmatched URLs across the whole app
// (we have multiple root layouts via route groups, so a single
// `not-found.tsx` can't compose them — see next.config.ts and the
// Next.js docs on file-conventions/not-found).
//
// This file BYPASSES normal rendering, so it must import its own
// global styles and fonts and emit a full <html>/<body>. It also
// returns a real 404 status code (vs. the silent 200 you get from
// composed not-founds in multi-root apps).
//
// `app/not-found.tsx` is still used for `notFound()` calls inside
// route segments (e.g. when a [slug] is missing in Payload).

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Page not found — Two Wheel Obsession",
  description: "The page you're looking for doesn't exist. Browse new bikes, used bikes, and parts at Two Wheel Obsession.",
}

const LINKS = [
  { eyebrow: "Browse", title: "New motorcycles", href: "/new-bikes" },
  { eyebrow: "Browse", title: "Motorcycle runouts", href: "/used-bikes" },
  { eyebrow: "Workshop", title: "Service & repairs", href: "/service-and-repairs" },
  { eyebrow: "Get in touch", title: "Contact us", href: "/contact-us" },
]

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-zinc-900 antialiased">
        <SiteHeader />
        <main className="flex-1">
          <section className="bg-zinc-50">
            <div className="max-w-2xl mx-auto px-6 py-24 md:py-32 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
                404 — Page not found
              </p>
              <h1 className="mt-3 text-3xl md:text-5xl font-bold text-zinc-900">
                That bike&apos;s left the garage
              </h1>
              <p className="mt-5 text-zinc-700">
                The page you&apos;re after doesn&apos;t exist anymore — or maybe it never did.
                Try one of these instead, or give us a call.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 text-left">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="block bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition p-4 rounded-md"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        {l.eyebrow}
                      </p>
                      <p className="mt-1 font-semibold text-zinc-900">{l.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-sm text-zinc-600">
                Or call us:{" "}
                <a href="tel:+61243319007" className="font-semibold text-red-600 hover:underline">
                  (02) 4331 9007
                </a>
              </p>
            </div>
          </section>
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
