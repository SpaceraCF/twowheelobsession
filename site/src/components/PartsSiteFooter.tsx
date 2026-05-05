import Image from "next/image"
import Link from "next/link"

export function PartsSiteFooter() {
  return (
    <footer className="mt-24 bg-black text-white">
      <div className="border-t-2 border-red-600" aria-hidden />

      <div className="max-w-[1400px] mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image
            src="/parts/yamaha-revs-red.png"
            alt="Yamaha — Revs Your Heart"
            width={316}
            height={100}
            className="h-10 w-auto invert"
          />
          <p className="mt-2 text-2xl font-extrabold tracking-tight">Parts Australia</p>
          <p className="mt-4 text-sm text-white/70 max-w-md leading-relaxed">
            Genuine Yamaha OEM parts and accessories. Operated by Two Wheel
            Obsession — an authorised Yamaha dealer on the NSW Central Coast.
          </p>
          <a
            href="https://www.twowheelobsession.com.au"
            className="mt-4 inline-block text-sm text-white/80 hover:text-white underline underline-offset-4"
          >
            Visit Two Wheel Obsession →
          </a>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500">
            Get in touch
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/90">
            <li>
              <a href="tel:+61243319007" className="hover:text-white">
                (02) 4331 9007
              </a>
            </li>
            <li>
              <a
                href="mailto:info@twowheelobsession.com.au"
                className="hover:text-white break-all"
              >
                info@twowheelobsession.com.au
              </a>
            </li>
            <li className="text-white/70">
              169 Manns Road
              <br />
              West Gosford, NSW 2250
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500">
            Hours
          </p>
          <ul className="mt-3 space-y-1 text-sm text-white/90">
            <li>Mon–Fri 8:30am–5:30pm</li>
            <li>Sat 9am–1pm</li>
            <li className="text-white/60">Sun closed</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 text-xs flex flex-wrap items-center justify-between gap-3 text-white/70">
          <span>© Two Wheel Obsession — All rights reserved</span>
          <nav aria-label="Legal" className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
