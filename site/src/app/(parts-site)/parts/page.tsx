import Image from "next/image"
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
    <section className="relative overflow-hidden bg-black text-white">
      {/* Hero motorcycle image — high-contrast Yamaha racing imagery
          on the right; gradient overlay keeps headline legible. */}
      <div className="absolute inset-0 lg:left-[40%]">
        <Image
          src="/parts/mt07-studio.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-center mix-blend-screen opacity-50 lg:opacity-90"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/40 lg:via-black/80 lg:to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" aria-hidden />

      <div className="relative max-w-[1400px] mx-auto px-6 py-20 md:py-28 lg:py-32 grid gap-12 lg:grid-cols-[1.4fr_1fr] items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-500">
            Authorised Yamaha dealer · NSW Central Coast
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Find the exact{" "}
            <span className="text-red-500">Yamaha part.</span>
            <br className="hidden md:block" />
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
              className="inline-flex h-12 items-center px-6 bg-red-600 text-white font-bold uppercase text-sm tracking-wider hover:bg-red-700 transition-colors"
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
            <Trust label="Flat-rate shipping" />
            <Trust label="Fast dispatch" />
          </ul>
        </div>
      </div>
    </section>
  )
}

function Trust({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-red-500 shrink-0">
        <CheckIcon />
      </span>
      <span className="text-white/85">{label}</span>
    </li>
  )
}

function PillarStrip() {
  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">
              The Yamaha catalogue
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">
              Everything genuine. Under one roof.
            </h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PillarCard
            kicker="Genuine"
            title="Yamaha OEM Parts"
            body="Engine internals, chassis, electrics, fairings — direct from Yamaha Australia."
            visual={
              <div className="absolute inset-0 bg-black flex items-center justify-center p-8">
                <Image
                  src="/parts/yamaha-revs-red.png"
                  alt=""
                  width={316}
                  height={100}
                  className="w-full max-w-[180px] h-auto invert"
                />
              </div>
            }
          />
          <PillarCard
            kicker="Performance"
            title="GYTR"
            body="Genuine Yamaha Technology Racing — track-bred performance parts for road and dirt."
            visual={
              <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
                <span className="text-5xl font-black tracking-[0.05em] text-red-600 [text-shadow:0_2px_30px_rgba(220,38,38,0.4)]">
                  GYTR
                </span>
              </div>
            }
          />
          <PillarCard
            kicker="Maintenance"
            title="Yamalube"
            body="Engineered specifically for Yamaha engines. Oils, filters, chemicals and lubricants."
            visual={
              <Image
                src="/parts/yamalube.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            }
          />
          <PillarCard
            kicker="Accessories"
            title="Genuine Accessories"
            body="Luggage, screens, protectors, riding gear — designed and tested for your specific bike."
            visual={
              <Image
                src="/parts/mt07-studio.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover object-center"
              />
            }
          />
        </div>
      </div>
    </section>
  )
}

function PillarCard({
  kicker,
  title,
  body,
  visual,
}: {
  kicker: string
  title: string
  body: string
  visual: React.ReactNode
}) {
  return (
    <article className="group relative bg-white border border-zinc-200 overflow-hidden hover:border-zinc-400 transition-colors">
      <div className="relative aspect-[5/3] bg-zinc-100 overflow-hidden">{visual}</div>
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">
          {kicker}
        </p>
        <h3 className="mt-1.5 text-lg font-bold text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{body}</p>
      </div>
    </article>
  )
}

function FinderSection() {
  return (
    <section id="finder" className="bg-zinc-50 border-b border-zinc-200 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">
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
            className="inline-flex h-11 items-center px-5 bg-red-600 text-white font-semibold uppercase text-xs tracking-wider hover:bg-red-700 transition-colors"
          >
            Send a parts enquiry
          </Link>
        </div>

        <div className="bg-white border border-zinc-200 overflow-hidden">
          <iframe
            title="Yamaha Genuine Parts Finder"
            src="/oem-widget"
            className="block w-full"
            style={{ height: "min(90vh, 1400px)", minHeight: 800, border: 0 }}
            loading="lazy"
          />
        </div>
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
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">
          Why us
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 max-w-2xl">
          Genuine parts. Real expertise. No guesswork.
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((item) => (
            <div key={item.title}>
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
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
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">
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
              <a href="tel:+61243319007" className="hover:text-red-600 font-semibold text-zinc-900">
                (02) 4331 9007
              </a>
            } />
            <ContactRow label="Email" value={
              <a href="mailto:info@twowheelobsession.com.au" className="hover:text-red-600 text-zinc-900 break-all">
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
