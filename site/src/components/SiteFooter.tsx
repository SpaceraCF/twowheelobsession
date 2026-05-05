import Image from "next/image"
import Link from "next/link"

// Site-wide footer. Note: the "Own it now, pay later" banner is no
// longer rendered here — Zip and Afterpay only apply to parts &
// accessories, not bikes (bikes go through finance enquiry instead).
// Pages that should show the banner import `PaymentPromoBanner`
// directly and render it above the footer in their own JSX.
export function SiteFooter() {
  return (
    <footer className="mt-16">
      <FooterMain />
      <FooterBottomBar />
    </footer>
  )
}

/**
 * "Own it now, pay later" promo for parts/accessories pages. NOT for
 * bike pages — Zip and Afterpay don't apply to bike purchases.
 * Render this just above `<SiteFooter />` on pages where the messaging
 * is appropriate (home, OEM Parts Finder, contact-us general).
 */
export function PaymentPromoBanner() {
  // Background matches the exact navy in the banner image (sampled #02023f),
  // so the wrapper extends seamlessly on screens wider than the image.
  return (
    <section className="bg-[#02023f]">
      <div className="max-w-[1400px] mx-auto">
        <Image
          src="/own-it-now-pay-later.png"
          alt="Own it now, pay later on parts & accessories — interest free always, flexible payments with Afterpay, Zip and PayPal. Bikes are not eligible — see finance options on each bike page."
          width={2048}
          height={501}
          className="w-full h-auto"
          sizes="(min-width: 1400px) 1400px, 100vw"
        />
        <p className="text-center text-xs text-white/70 px-4 pb-3 -mt-1">
          Pay-later options apply to parts &amp; accessories.{" "}
          <Link href="/new-bikes" className="underline hover:text-white">
            For bike finance, see each bike page.
          </Link>
        </p>
      </div>
    </section>
  )
}

function FooterMain() {
  return (
    <section className="bg-white border-t border-zinc-200">
      <div className="max-w-[1400px] mx-auto px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <Image
            src="/two-wheel-obsession-logo.jpg"
            alt="Two Wheel Obsession"
            width={768}
            height={166}
            className="h-12 w-auto"
          />
          <dl className="mt-8 text-sm space-y-3 text-zinc-800">
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <dt className="font-semibold">Phone:</dt>
              <dd>
                <a href="tel:+61243319007" className="hover:text-red-600">
                  +(02) 4331 9007
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <dt className="font-semibold">Email:</dt>
              <dd>
                <a
                  href="mailto:enquiries@twowheelobsession.com.au"
                  className="hover:text-red-600 break-all"
                >
                  enquiries@twowheelobsession.com.au
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <dt className="font-semibold">Address:</dt>
              <dd>169 Manns Road, West Gosford, NSW 2250</dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center pt-2">
              <dt className="font-semibold">Social:</dt>
              <dd>
                <a
                  href="https://www.facebook.com/TwoWheelObsession"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-zinc-300 hover:border-zinc-700 hover:text-red-600 inline-flex items-center justify-center"
                >
                  <FbIcon />
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <iframe
            title="Map — 169 Manns Road, West Gosford NSW 2250"
            src="https://maps.google.com/maps?q=169%20Manns%20Road%20West%20Gosford%20NSW%202250&t=&z=11&ie=UTF8&iwloc=&output=embed"
            className="w-full h-72 md:h-full min-h-72 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col items-start gap-8">
          <Link href="/oem-parts-finder" className="hover:opacity-80">
            <Image
              src="/oem-parts-finder.png"
              alt="Yamaha OEM Parts Finder"
              width={310}
              height={97}
              className="h-12 w-auto"
            />
          </Link>
          <div>
            <h4 className="text-zinc-900 font-semibold text-lg">My Account</h4>
            <ul className="mt-3 text-sm space-y-2 text-zinc-700">
              <li>
                <Link href="/admin" className="hover:text-red-600">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterBottomBar() {
  return (
    <div className="bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-4 text-xs flex flex-wrap items-center justify-between gap-3">
        <span>Two Wheels — All rights reserved</span>
        <nav aria-label="Legal" className="flex gap-5">
          <Link href="/privacy-policy" className="text-zinc-400 hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="text-zinc-400 hover:text-white">
            Terms
          </Link>
        </nav>
      </div>
    </div>
  )
}

function FbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  )
}
