import Image from "next/image"
import Link from "next/link"

import { CartPill } from "./CartPill"

const NAV = [
  { label: "Home", href: "/" },
  { label: "Find Parts", href: "/#finder" },
  { label: "Contact", href: "/#contact" },
]

export function PartsSiteHeader() {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      {/* Thin black utility bar — Yamaha black/red identity. */}
      <div className="hidden md:block bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center gap-6 text-[11px]">
          <span className="opacity-90">Authorised Yamaha Dealer</span>
          <span className="opacity-50">·</span>
          <span className="opacity-90">169 Manns Road, West Gosford NSW</span>
          <span className="opacity-50">·</span>
          <span className="opacity-90">Mon–Fri 8:30am–5:30pm, Sat 9am–1pm</span>
          <a href="tel:+61243319007" className="ml-auto font-semibold hover:text-red-500">
            (02) 4331 9007
          </a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center gap-8">
        <Link href="/" className="shrink-0 flex items-center gap-3 leading-none">
          <Image
            src="/parts/yamaha-revs-red.png"
            alt="Yamaha"
            width={316}
            height={100}
            className="h-9 w-auto"
            priority
          />
          <span className="hidden sm:block h-9 w-px bg-zinc-200" aria-hidden />
          <span className="hidden sm:block">
            <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Parts
            </span>
            <span className="block text-lg font-extrabold tracking-tight text-zinc-900 -mt-0.5">
              Australia
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 ml-auto text-[13px] font-semibold tracking-wider uppercase text-zinc-900">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-red-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-3">
          <CartPill />
          <a
            href="tel:+61243319007"
            className="md:hidden text-[13px] font-bold text-red-600"
          >
            (02) 4331 9007
          </a>
        </div>
      </div>
    </header>
  )
}
