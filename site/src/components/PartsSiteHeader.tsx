import Link from "next/link"

const NAV = [
  { label: "Home", href: "/" },
  { label: "Find Parts", href: "/#finder" },
  { label: "Contact", href: "/#contact" },
]

export function PartsSiteHeader() {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      <div className="hidden md:block bg-[#0d1f4d] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center gap-6 text-[11px]">
          <span className="opacity-90">Authorised Yamaha Dealer</span>
          <span className="opacity-50">·</span>
          <span className="opacity-90">169 Manns Road, West Gosford NSW</span>
          <span className="opacity-50">·</span>
          <span className="opacity-90">Mon–Fri 8:30am–5:30pm, Sat 9am–1pm</span>
          <a href="tel:+61243319007" className="ml-auto font-semibold hover:underline">
            (02) 4331 9007
          </a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center gap-8">
        <Link href="/" className="shrink-0 leading-none">
          <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#0d1f4d]">
            Yamaha Parts
          </span>
          <span className="block text-2xl font-extrabold tracking-tight text-zinc-900 -mt-0.5">
            Australia
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 ml-auto text-[13px] font-semibold tracking-wider uppercase text-zinc-900">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-[#0d1f4d] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="tel:+61243319007"
          className="md:hidden ml-auto text-[13px] font-bold text-[#0d1f4d]"
        >
          (02) 4331 9007
        </a>
      </div>
    </header>
  )
}
