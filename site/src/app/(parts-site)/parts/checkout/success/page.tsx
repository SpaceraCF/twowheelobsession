import Link from "next/link"
import { Suspense } from "react"

import { CheckoutSuccessClient } from "@/components/CheckoutSuccessClient"

export const metadata = {
  title: "Order received — Yamaha Parts Australia",
  description:
    "Thanks for your order. We've sent a confirmation by email and will pack it for dispatch.",
}

export default function CheckoutSuccessPage() {
  return (
    <section className="bg-zinc-50">
      <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="5 12 10 17 19 8" />
          </svg>
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">
          Order received
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
          Thanks — we've got your order.
        </h1>

        <Suspense fallback={null}>
          <CheckoutSuccessClient />
        </Suspense>

        <p className="mt-6 text-zinc-700 leading-relaxed max-w-md mx-auto">
          We've emailed a copy of the order to you and our parts team. Most
          orders ship within one business day. If anything's missing or
          unclear, we'll call the number you gave us.
        </p>

        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex h-11 items-center px-5 bg-zinc-900 text-white font-semibold uppercase text-xs tracking-wider hover:bg-black"
          >
            Back to parts finder
          </Link>
          <a
            href="tel:+61243319007"
            className="inline-flex h-11 items-center px-5 border border-zinc-300 text-zinc-900 font-semibold uppercase text-xs tracking-wider hover:border-zinc-900"
          >
            (02) 4331 9007
          </a>
        </div>
      </div>
    </section>
  )
}
