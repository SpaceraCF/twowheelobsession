import Link from "next/link"

export const metadata = {
  title: "Parts & Accessories | Two Wheel Obsession",
  description:
    "Genuine OEM parts and accessories for Yamaha, Suzuki, CFMOTO and most road and off-road motorcycles. Authorised dealer pricing.",
}

const BRANDS = [
  { name: "Yamaha", note: "Genuine OEM parts catalogue" },
  { name: "Suzuki", note: "Full OEM parts access" },
  { name: "CFMOTO", note: "Authorised dealer parts" },
  { name: "Other makes", note: "Most road and off-road bikes — call us" },
]

const CATEGORIES = [
  "Engine & drivetrain",
  "Brakes & suspension",
  "Tyres & wheels",
  "Bodywork & plastics",
  "Electrical & batteries",
  "Service items (oil, filters, plugs)",
  "Riding gear & accessories",
  "Crash damage & warranty",
]

export default function PartsPage() {
  return (
    <div className="bg-white">
      <section className="bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Genuine parts
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Parts & Accessories</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-300">
            Genuine OEM parts and authorised-dealer accessories for Yamaha, Suzuki, CFMOTO and most
            road and off-road motorcycles. Tell us your bike + the part and we'll come back with
            availability and a price.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact-us?type=parts"
              className="inline-flex h-12 items-center px-6 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
            >
              Get a parts quote
            </Link>
            <a
              href="tel:+61243319007"
              className="inline-flex h-12 items-center px-6 border border-white/30 text-white font-semibold uppercase text-sm tracking-wider hover:bg-white/10"
            >
              Call (02) 4331 9007
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Brands</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">
            What we source
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BRANDS.map((b) => (
              <li key={b.name} className="border border-zinc-200 p-5">
                <h3 className="font-semibold text-lg text-zinc-900">{b.name}</h3>
                <p className="mt-1 text-sm text-zinc-700">{b.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-zinc-50">
        <div className="max-w-[1400px] mx-auto px-6 py-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
              Categories
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">
              Anything you need
            </h2>
            <p className="mt-3 text-zinc-700">
              From service items to crash damage — if it fits a Yamaha, Suzuki or CFMOTO, we can
              get it. Most popular OEM parts arrive within 2–5 business days.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <li key={c} className="flex items-start gap-2 text-zinc-800">
                <span aria-hidden className="text-red-600 mt-0.5">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
            Tell us about your bike
          </h2>
          <p className="mt-4 text-zinc-700">
            What's the make, model and year? What part are you after? The more detail you can give
            us — VIN, photo, part number — the faster we can come back with a price.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact-us?type=parts"
              className="inline-flex h-12 items-center px-6 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
            >
              Send a parts enquiry
            </Link>
            <a
              href="mailto:enquiries@twowheelobsession.com.au?subject=Parts%20enquiry"
              className="inline-flex h-12 items-center px-6 border border-zinc-300 text-zinc-900 font-semibold uppercase text-sm tracking-wider hover:border-zinc-700"
            >
              Email us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
