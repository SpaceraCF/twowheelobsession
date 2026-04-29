import { Suspense } from "react"

import { EnquiryForm } from "@/components/EnquiryForm"

export const metadata = {
  title: "Contact Us | Two Wheel Obsession",
  description:
    "Get in touch with Two Wheel Obsession on the NSW Central Coast. Phone, email, and a contact form for new bikes, used bikes, parts and general enquiries.",
}

export default function ContactPage() {
  return (
    <>
      <section className="bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Get in touch
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Contact Us</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-300">
            Drop in to the showroom at West Gosford, give us a call, or send a message — we'll come
            back to you fast.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-14 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <aside className="space-y-8">
            <Detail
              label="Phone"
              value={
                <a href="tel:+61243319007" className="hover:text-red-600">
                  (02) 4331 9007
                </a>
              }
            />
            <Detail
              label="Email"
              value={
                <a
                  href="mailto:enquiries@twowheelobsession.com.au"
                  className="hover:text-red-600 break-all"
                >
                  enquiries@twowheelobsession.com.au
                </a>
              }
            />
            <Detail
              label="Address"
              value={<>169 Manns Road<br />West Gosford, NSW 2250</>}
            />
            <Detail
              label="Hours"
              value={
                <>
                  Mon&ndash;Fri 8:30am&ndash;5:30pm<br />
                  Sat 9am&ndash;1pm<br />
                  Sun closed
                </>
              }
            />

            <div>
              <iframe
                title="Map — 169 Manns Road, West Gosford NSW 2250"
                src="https://maps.google.com/maps?q=169%20Manns%20Road%20West%20Gosford%20NSW%202250&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-72 border border-zinc-200"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </aside>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Send a message</h2>
            <p className="mt-2 text-zinc-700">
              Pick the closest enquiry type below — it routes to the right person internally.
            </p>
            <div className="mt-6">
              <Suspense>
                <EnquiryForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <div className="mt-2 text-base text-zinc-900 leading-relaxed">{value}</div>
    </div>
  )
}
