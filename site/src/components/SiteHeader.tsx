import Image from "next/image"
import Link from "next/link"

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop Motorcycles", href: "/new-bikes" },
  { label: "Shop Parts", href: "/oem-parts-finder" },
  { label: "Motorcycle Runouts", href: "/used-bikes" },
  { label: "Contact Us", href: "/contact-us" },
]

const BRAND_LOGOS = [
  { src: "/brand/yamaha.png", alt: "Yamaha — Revs Your Heart", w: 100, h: 34, h_class: "h-7" },
  { src: "/brand/cfmoto.jpg", alt: "CFMOTO", w: 500, h: 100, h_class: "h-7" },
  { src: "/brand/suzuki.jpg", alt: "Suzuki", w: 64, h: 49, h_class: "h-11" },
  { src: "/brand/ymf.png", alt: "Yamaha Motor Finance", w: 100, h: 31, h_class: "h-7" },
  { src: "/brand/ymi.png", alt: "Yamaha Motor Insurance", w: 100, h: 36, h_class: "h-8" },
]

export function SiteHeader() {
  return (
    <header className="bg-white border-b border-[--color-line]">
      <div className="hidden md:block border-b border-[--color-line]">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-6">
          <Link href="/oem-parts-finder" className="shrink-0 hover:opacity-80">
            <Image
              src="/oem-parts-finder.png"
              alt="Yamaha OEM Parts Finder"
              width={310}
              height={97}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-600">
            <ClockIcon />
            <span>Mon–Fri 8:30am–5:30pm,</span>
            <span>Sat 9am–1pm,</span>
            <span>Sun Closed</span>
          </div>

          <div className="ml-auto flex items-center gap-5 shrink-0">
            {BRAND_LOGOS.map((b) => (
              <Image
                key={b.src}
                src={b.src}
                alt={b.alt}
                width={b.w}
                height={b.h}
                className={`${b.h_class} w-auto object-contain`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/two-wheel-obsession-logo.jpg"
            alt="Two Wheel Obsession"
            width={768}
            height={166}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 mx-auto text-[13px] font-semibold tracking-wider uppercase text-black">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-black hover:text-[--color-accent] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Customer-facing icons (search, wishlist, cart) intentionally omitted
            in v1 — we don't have e-commerce yet and dead icons are worse than
            no icons. Staff link via the admin button. */}
        <div className="flex items-center gap-5 text-black ml-auto lg:ml-0">
          <Link
            href="/admin"
            aria-label="Staff admin"
            title="Staff admin"
            className="hover:text-[--color-accent]"
          >
            <UserIcon />
          </Link>
        </div>
      </div>
    </header>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
