import { ServiceRequestForm } from "@/components/ServiceRequestForm"

export const metadata = {
  title: "Service & Repairs | Two Wheel Obsession",
  description:
    "Authorised Yamaha, Suzuki and CFMOTO workshop on the NSW Central Coast. Scheduled servicing, repairs, tyres, roadworthy inspections.",
}

const HIGHLIGHTS = [
  {
    title: "Authorised dealer workshop",
    body:
      "Factory-trained technicians servicing Yamaha, Suzuki and CFMOTO. Full warranty, dealer software, OEM parts.",
  },
  {
    title: "All makes welcome",
    body:
      "Riding something else? We service most road and off-road bikes — call us with what you're on and what's needed.",
  },
  {
    title: "Tyres, brakes & batteries",
    body:
      "Quick-turnaround tyre fits, brake pad and rotor work, battery replacement and full pre-rego inspections.",
  },
]

const PROCESS = [
  { step: "1", title: "Submit a request", body: "Tell us your bike and what's going on. We'll come back with timing and a quote." },
  { step: "2", title: "Drop your bike off", body: "Bring it to the workshop at 169 Manns Road, West Gosford." },
  { step: "3", title: "We do the work", body: "All work logged, photos for anything significant, parts kept aside if you want them." },
  { step: "4", title: "Pickup", body: "Pay & ride off. Service history goes straight into your customer record." },
]

export default function ServiceAndRepairsPage() {
  return (
    <>
      <section className="bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Workshop
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Service &amp; Repairs</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-300">
            Authorised Yamaha, Suzuki and CFMOTO workshop on the NSW Central Coast. Scheduled
            servicing, repairs, tyres, roadworthy inspections, and warranty work.
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

      <section className="bg-zinc-50">
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">How it works</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-zinc-900">A simple process</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <li key={p.step} className="bg-white border border-zinc-200 p-6">
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

      <section id="book" className="bg-white">
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
