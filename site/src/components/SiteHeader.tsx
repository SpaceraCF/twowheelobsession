import Image from "next/image"
import Link from "next/link"

import { HeaderAccountMenu } from "./account/HeaderAccountMenu"
import { CartPill } from "./CartPill"
import { MobileNav } from "./MobileNav"
import { SearchBox } from "./SearchBox"

// Desktop nav drops "Home" — the wordmark is the home link, which is
// the convention and buys back the width the search box needs. The
// mobile menu carries the full list including Home.
const NAV = [
  { label: "Shop Motorcycles", href: "/new-bikes" },
  { label: "Runouts", href: "/used-bikes" },
  { label: "Shop Parts", href: "/oem-parts-finder" },
  { label: "Service", href: "/service-and-repairs" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact-us" },
]

const MOBILE_NAV = [{ label: "Home", href: "/" }, ...NAV]

// Heights are per-logo on purpose. These five assets have wildly
// different aspect ratios (CFMOTO is 5:1, Suzuki is 1.3:1), so a single
// uniform height class makes some look enormous and others tiny — the
// eye reads equal AREA, not equal height. w/h below are the true
// intrinsic pixel dimensions so next/image sizes them correctly.
const BRAND_LOGOS = [
  { src: "/brand/yamaha.png", alt: "Yamaha — Revs Your Heart", w: 316, h: 108, cls: "h-7 sm:h-9" },
  { src: "/brand/cfmoto.jpg", alt: "CFMOTO", w: 500, h: 100, cls: "h-5 sm:h-7" },
  { src: "/brand/suzuki.jpg", alt: "Suzuki", w: 150, h: 115, cls: "h-9 sm:h-12" },
  { src: "/brand/ymf.png", alt: "Yamaha Motor Finance", w: 1929, h: 599, cls: "h-6 sm:h-8" },
  { src: "/brand/ymi.png", alt: "Yamaha Motor Insurance", w: 1772, h: 650, cls: "h-7 sm:h-9" },
]

export function SiteHeader() {
  return (
    <header className="bg-white border-b border-[--color-line]">
      {/* Utility bar. The brand logos used to be squeezed in here at
          h-7 alongside everything else and vanished entirely below md.
          They're now the point of this row, roughly a third larger, and
          they stay visible on mobile (wrapped and centred). */}
      <div className="border-b border-[--color-line]">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="/oem-parts-finder"
            className="hidden md:block shrink-0 hover:opacity-80"
          >
            <Image
              src="/oem-parts-finder.png"
              alt="Yamaha OEM Parts Finder"
              width={310}
              height={97}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <div className="hidden xl:flex items-center gap-2 text-[11px] text-zinc-600">
            <ClockIcon />
            <span>Mon–Fri 8:30am–5:30pm,</span>
            <span>Sat 9am–1pm,</span>
            <span>Sun Closed</span>
          </div>

          <div className="md:ml-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-7 shrink-0">
            {BRAND_LOGOS.map((b) => (
              <Image
                key={b.src}
                src={b.src}
                alt={b.alt}
                width={b.w}
                height={b.h}
                className={`${b.cls} w-auto object-contain`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/two-wheel-obsession-logo.jpg"
            alt="Two Wheel Obsession"
            width={768}
            height={166}
            priority
            className="h-10 sm:h-12 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold tracking-wider uppercase text-black">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-black hover:text-[--color-accent] transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Most visitors arrive hunting a specific model, so search gets
            real estate in the main bar from md up rather than hiding
            behind an icon. */}
        <SearchBox id="site-search-desktop" className="hidden md:flex ml-auto w-full max-w-[260px]" />

        {/* Cart pill is hidden when the cart's empty (this is the main
            TWO site — most visitors are here for bikes/service and
            shouldn't see e-commerce chrome). The moment someone adds a
            part from the OEM finder iframe, the pill appears and the
            drawer opens automatically. Admin entry is still by typing
            /admin directly — kept off the chrome to reduce surface. */}
        <div className="ml-auto md:ml-0 flex items-center gap-4 shrink-0">
          <div className="hidden md:block">
            <HeaderAccountMenu />
          </div>
          <CartPill hideWhenEmpty />
          <MobileNav items={MOBILE_NAV} />
        </div>
      </div>

      {/* Mobile search gets its own row — an expanding icon costs a tap
          on the control most phone visitors came here to use. */}
      <div className="md:hidden border-t border-[--color-line] px-6 py-3">
        <SearchBox id="site-search-mobile" placeholder="Search bikes — e.g. MT-07, Tracer" />
      </div>
    </header>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
