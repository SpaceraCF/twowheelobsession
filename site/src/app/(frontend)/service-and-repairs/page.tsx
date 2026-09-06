import Link from "next/link"

import { JsonLd } from "@/components/JsonLd"
import { ServiceRequestForm } from "@/components/ServiceRequestForm"
import {
  CENTRAL_COAST_SUBURBS,
  MAIN_SITE_URL,
  breadcrumbJsonLd,
  faqJsonLd,
  motorcycleServiceJsonLd,
} from "@/lib/seo/jsonld"

// This page targets "motorcycle service central coast" and its
// variants. The previous version was ~400 words with a generic
// "Service & Repairs" H1 and no location signal anywhere, which is
// most of the reason it never ranked. Depth here is deliberate:
// what's actually done, what it costs to ask, where we draw from,
// and answers to what people actually type into Google.
export const metadata = {
  title: "Motorcycle Service Central Coast | Two Wheel Obsession, West Gosford",
  description:
    "Motorcycle servicing and repairs on the NSW Central Coast. Authorised Yamaha, Suzuki and CFMOTO workshop in West Gosford — logbook servicing, tyres, brakes, repairs and warranty work on all makes.",
  alternates: { canonical: `${MAIN_SITE_URL}/service-and-repairs` },
  openGraph: {
    title: "Motorcycle Service Central Coast | Two Wheel Obsession",
    description:
      "Authorised Yamaha, Suzuki and CFMOTO workshop in West Gosford. Logbook servicing, repairs, tyres and warranty work — all makes welcome.",
    url: `${MAIN_SITE_URL}/service-and-repairs`,
    type: "website",
  },
}

const HIGHLIGHTS = [
  {
    title: "Authorised dealer workshop",
    body: "Factory-trained technicians servicing Yamaha, Suzuki and CFMOTO with dealer diagnostic software and genuine OEM parts, so your factory warranty stays intact.",
  },
  {
    title: "All makes welcome",
    body: "Riding something else? We service most road and off-road bikes. Call us with what you're on and what it needs and we'll tell you straight away if we can help.",
  },
  {
    title: "Tyres, brakes & batteries",
    body: "Quick-turnaround tyre fitting and balancing, brake pad and rotor work, chain and sprocket replacement, batteries, and pre-purchase inspections.",
  },
]

const LOGBOOK_INCLUDES = [
  "Engine oil and filter replacement",
  "Valve clearance check (at the intervals your logbook specifies)",
  "Air filter inspection or replacement",
  "Spark plug inspection or replacement",
  "Coolant and brake fluid level and condition check",
  "Chain tension, alignment, lubrication — or final drive check",
  "Brake pad and disc wear measurement",
  "Tyre condition and pressure check",
  "Suspension, steering head and wheel bearing check",
  "Lights, horn, switches and electrical check",
  "Diagnostic scan for fault codes",
  "Logbook stamped and service history recorded against your account",
]

const REPAIRS = [
  "Diagnostics and fault finding",
  "Tyre fitting and wheel balancing",
  "Brake pads, rotors and hydraulics",
  "Chain and sprocket replacement",
  "Suspension service and setup",
  "Clutch and cable replacement",
  "Battery testing and replacement",
  "Pre-purchase and pre-rego inspections",
  "Warranty and recall work",
  "Crash repair assessment",
]

const PROCESS = [
  { step: "1", title: "Submit a request", body: "Tell us your bike and what's going on. We'll come back with timing and a quote." },
  { step: "2", title: "Drop your bike off", body: "Bring it to the workshop at 169 Manns Road, West Gosford — just off the Central Coast Highway." },
  { step: "3", title: "We do the work", body: "All work logged, photos for anything significant, old parts kept aside if you want them." },
  { step: "4", title: "Pickup", body: "Pay and ride off. Service history goes straight into your customer record." },
]

const FAQ = [
  {
    question: "How often should I service my motorcycle?",
    answer:
      "Most modern road bikes run to a schedule of roughly every 10,000km or 12 months, whichever comes first, with an early run-in service around 1,000km on a new bike. Off-road and competition bikes are serviced far more often, sometimes by hours rather than kilometres. Your logbook is the authority — bring it in and we'll work to it.",
  },
  {
    question: "Will servicing here void my new bike warranty?",
    answer:
      "No. We're an authorised Yamaha, Suzuki and CFMOTO dealer, so logbook servicing done here with genuine parts keeps your factory warranty intact. We can also carry out warranty and recall work directly.",
  },
  {
    question: "Do you service brands you don't sell?",
    answer:
      "Yes. We service most road and off-road motorcycles regardless of where they were bought. Give us a call with the make, model and year and what it needs, and we'll tell you honestly whether we're the right workshop for it.",
  },
  {
    question: "How much does a motorcycle service cost?",
    answer:
      "It depends on the bike and which service is due — a minor oil-and-filter service and a major valve-clearance service are very different jobs. Send us your bike details through the form below or call the workshop and we'll quote before any work starts.",
  },
  {
    question: "Where are you located?",
    answer:
      "169 Manns Road, West Gosford NSW 2250. We're the workshop most riders across the Central Coast use — from Gosford, Erina and Terrigal through to Woy Woy, Wyong, Tuggerah and The Entrance.",
  },
  {
    question: "Can I wait while my bike is serviced?",
    answer:
      "For quick jobs like a tyre fit or a battery, often yes. Full logbook services generally need the bike for the day. Let us know when you book and we'll tell you what's realistic.",
  },
]

export default function ServiceAndRepairsPage() {
  return (
    <>
      <JsonLd
        data={[
          motorcycleServiceJsonLd(),
          faqJsonLd(FAQ),
          breadcrumbJsonLd([
            { name: "Home", url: MAIN_SITE_URL },
            { name: "Service & Repairs", url: `${MAIN_SITE_URL}/service-and-repairs` },
          ]),
        ]}
      />

      <section className="bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Workshop · West Gosford
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Motorcycle Service &amp; Repairs
            <span className="block text-red-500">Central Coast</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-300 leading-relaxed">
            An authorised Yamaha, Suzuki and CFMOTO workshop at 169 Manns Road,
            West Gosford. Logbook servicing, repairs, tyres, inspections and
            warranty work — on our brands and on most other makes as well.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#book"
              className="inline-flex h-12 items-center px-6 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
            >
              Book a service
            </a>
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
        <div className="max-w-[1400px] mx-auto px-6 py-14 grid gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title}>
              <h2 className="text-lg font-bold text-zinc-900">{item.title}</h2>
              <p className="mt-2 text-sm text-zinc-700 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-14 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
              Logbook servicing
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">
              What&apos;s in a scheduled service
            </h2>
            <p className="mt-3 text-zinc-700 leading-relaxed">
              Exactly what gets done depends on which service is due in your
              logbook — a minor oil-and-filter service and a major
              valve-clearance service are very different jobs. A typical
              scheduled service covers:
            </p>
            <ul className="mt-5 space-y-2">
              {LOGBOOK_INCLUDES.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-zinc-800">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
              Repairs &amp; other work
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">
              Beyond scheduled servicing
            </h2>
            <p className="mt-3 text-zinc-700 leading-relaxed">
              Not everything happens on a schedule. The workshop also handles:
            </p>
            <ul className="mt-5 space-y-2">
              {REPAIRS.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-zinc-800">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 bg-white border border-zinc-200 p-5">
              <h3 className="font-semibold text-zinc-900">Need a part instead?</h3>
              <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
                If you do your own spannering, look up genuine Yamaha parts by
                model and year in our{" "}
                <Link href="/oem-parts-finder" className="text-red-600 hover:underline">
                  OEM parts finder
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">How it works</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">A simple process</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <li key={p.step} className="bg-zinc-50 border border-zinc-200 p-6">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-red-600 text-white font-bold">
                  {p.step}
                </span>
                <h3 className="mt-4 font-semibold text-zinc-900">{p.title}</h3>
                <p className="mt-2 text-sm text-zinc-700 leading-relaxed">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
            Common questions
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">
            Motorcycle servicing FAQs
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="group bg-white border border-zinc-200 p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-zinc-900 flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="text-red-600 shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-zinc-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <h2 className="text-lg font-bold text-zinc-900">
            Riders we look after across the Central Coast
          </h2>
          <p className="mt-2 text-sm text-zinc-700 leading-relaxed max-w-3xl">
            The workshop is at West Gosford, a few minutes off the M1, so we see
            bikes from right across the Coast:
          </p>
          <p className="mt-4 text-sm text-zinc-600 leading-relaxed">
            {CENTRAL_COAST_SUBURBS.join(" · ")}
          </p>
        </div>
      </section>

      <section id="book" className="bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
            Service request
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">
            Tell us about your bike
          </h2>
          <p className="mt-3 text-zinc-700">
            Submit a request and our workshop will be in touch with timing, a quote, and next steps.
          </p>

          <div className="mt-8">
            <ServiceRequestForm />
          </div>
        </div>
      </section>
    </>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-red-600"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
