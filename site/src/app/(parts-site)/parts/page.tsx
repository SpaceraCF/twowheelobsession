import Link from "next/link"

import { PartsEnquiryForm } from "@/components/PartsEnquiryForm"

export const metadata = {
  title: "Yamaha Parts Australia — Genuine OEM parts & accessories",
  description:
    "Look up any Yamaha part by model. Genuine OEM parts and accessories shipped Australia-wide from an authorised Yamaha dealer on the NSW Central Coast.",
}

export default function PartsHomePage() {
  return (
    <>
      <Hero />
      <PillarStrip />
      <FinderSection />
      <WhyUs />
      <ContactSection />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0d1f4d] text-white">
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_30%,white_0,transparent_50%),radial-gradient(circle_at_80%_70%,white_0,transparent_50%)]" />
      <div className="relative max-w-[1400px] mx-auto px-6 py-20 md:py-28 grid gap-12 lg:grid-cols-[1.4fr_1fr] items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">
            Authorised Yamaha dealer · NSW Central Coast
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Find the exact Yamaha part.{" "}
            <span className="text-white/70">In under a minute.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80 leading-relaxed">
            Look up any Yamaha part by model with the official EPC parts
            catalogue, then we ship it Australia-wide at a flat rate. Genuine
            OEM, every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#finder"
              className="inline-flex h-12 items-center px-6 bg-white text-[#0d1f4d] font-bold uppercase text-sm tracking-wider hover:bg-white/90"
            >
              Search the parts catalogue
            </Link>
            <a
              href="tel:+61243319007"
              className="inline-flex h-12 items-center px-6 border border-white/30 text-white font-semibold uppercase text-sm tracking-wider hover:border-white"
            >
              (02) 4331 9007
            </a>
          </div>
          <ul className="mt-10 grid grid-cols-3 gap-6 max-w-md text-sm">
            <Trust label="Genuine OEM" />
            <Trust label="Flat rate shipping" />
            <Trust label="Fast dispatch" />
          </ul>
        </div>

        <div className="relative hidden lg:block">
          <div className="aspect-[4/5] rounded-md bg-gradient-to-br from-white/5 via-white/10 to-transparent border border-white/10 p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-7xl font-extrabold tracking-tight leading-none">76</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/60">
                Yamaha models supported
              </p>
              <p className="mt-8 text-7xl font-extrabold tracking-tight leading-none">
                1000s
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/60">
                Genuine parts in the catalogue
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Trust({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckIcon />
      <span className="text-white/85">{label}</span>
    </li>
  )
}

const PILLARS = [
  {
    title: "Yamaha Genuine Parts",
    body: "Engine internals, chassis, electrics, fairings — sourced direct from Yamaha Australia.",
  },
  {
    title: "GYTR",
    body: "Genuine Yamaha Technology Racing — performance parts for road, track and off-road.",
  },
  {
    title: "Yamalube",
    body: "Engineered specifically for Yamaha engines. Oils, filters, chemicals, lubricants.",
  },
  {
    title: "Accessories",
    body: "Luggage, screens, protectors, riding gear and apparel — to suit your bike.",
  },
]

function PillarStrip() {
  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-white p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#0d1f4d]">
                Catalogue
              </p>
              <h3 className="mt-2 text-lg font-bold text-zinc-900">{p.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinderSection() {
  return (
    <section id="finder" className="bg-zinc-50 border-b border-zinc-200 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0d1f4d]">
              Step 1 · Find your part
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
              Yamaha Genuine Parts Finder
            </h2>
            <p className="mt-3 text-zinc-600 leading-relaxed">
              Pick your model, year and section. Click into the exploded
              diagrams to see every part, its reference number, and indicative
              price. When you've got the part numbers, send them through and
              we'll quote shipping and confirm stock.
            </p>
          </div>
          <Link
            href="#contact"
            className="inline-flex h-11 items-center px-5 bg-[#0d1f4d] text-white font-semibold uppercase text-xs tracking-wider hover:bg-[#0a1739]"
          >
            Send a parts enquiry
          </Link>
        </div>

        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          <iframe
            title="Yamaha Genuine Parts Finder"
            src="/oem-widget"
            className="block w-full"
            style={{ height: "min(90vh, 1400px)", minHeight: 800, border: 0 }}
            loading="lazy"
          />
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          Catalogue and pricing supplied by EPC Online. Final stock and
          shipping cost confirmed when we process your order.
        </p>
      </div>
    </section>
  )
}

const WHY_US = [
  {
    title: "Authorised dealer",
    body: "We're a long-standing Yamaha dealership, not a re-seller. Parts come direct from Yamaha Australia.",
  },
  {
    title: "Australia-wide shipping",
    body: "Flat-rate dispatch from West Gosford, NSW. Most orders ship within one business day.",
  },
  {
    title: "Real workshop knowledge",
    body: "Stuck between two part numbers? Send us your VIN — our workshop will tell you exactly what fits.",
  },
  {
    title: "Genuine warranty",
    body: "Yamaha parts come with the manufacturer warranty. We handle warranty claims on your behalf.",
  },
]

function WhyUs() {
  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0d1f4d]">
          Why us
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 max-w-2xl">
          Genuine parts. Real expertise. No guesswork.
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((item) => (
            <div key={item.title}>
              <div className="w-10 h-10 rounded-full bg-[#0d1f4d] text-white flex items-center justify-center">
                <CheckIcon />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="bg-zinc-50 border-t border-zinc-200 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0d1f4d]">
            Step 2 · Send us the part numbers
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
            Can't find it? We'll find it for you.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Tell us your bike (year, model, VIN if you have it) and what you're
            after. We'll come back with stock, price, and shipping.
          </p>

          <dl className="mt-8 space-y-5 text-sm">
            <ContactRow label="Phone" value={
              <a href="tel:+61243319007" className="hover:text-[#0d1f4d] font-semibold text-zinc-900">
                (02) 4331 9007
              </a>
            } />
            <ContactRow label="Email" value={
              <a href="mailto:info@twowheelobsession.com.au" className="hover:text-[#0d1f4d] text-zinc-900 break-all">
                info@twowheelobsession.com.au
              </a>
            } />
            <ContactRow label="Address" value={<>169 Manns Road, West Gosford NSW 2250</>} />
            <ContactRow label="Hours" value={<>Mon&ndash;Fri 8:30am&ndash;5:30pm · Sat 9am&ndash;1pm · Sun closed</>} />
          </dl>
        </div>

        <div>
          <PartsEnquiryForm />
        </div>
      </div>
    </section>
  )
}

function ContactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500 pt-0.5">
        {label}
      </dt>
      <dd className="text-zinc-700">{value}</dd>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="5 12 10 17 19 8" />
    </svg>
  )
}
