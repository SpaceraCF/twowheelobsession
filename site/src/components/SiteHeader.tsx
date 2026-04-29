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
      <div className="border-b border-[--color-line]">
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

        <div className="flex items-center gap-5 text-black ml-auto lg:ml-0">
          <button aria-label="Search" className="hover:text-black" type="button">
            <SearchIcon />
          </button>
          <Link href="/admin" aria-label="Account" className="hover:text-black">
            <UserIcon />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative hover:text-black">
            <HeartIcon />
            <span className="absolute -top-1.5 -right-2 bg-[--color-accent] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
              0
            </span>
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative hover:text-black">
            <CartIcon />
            <span className="absolute -top-1.5 -right-2 bg-[--color-accent] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
              0
            </span>
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
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
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
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
