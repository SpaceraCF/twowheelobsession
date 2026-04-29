import Link from "next/link"

export const metadata = {
  title: "Website Terms of Use",
  description:
    "Terms governing the use of the Two Wheel Obsession website. Sales, finance and service contracts have separate written terms supplied at point of sale.",
}

const LAST_UPDATED = "29 April 2026"

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="bg-zinc-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Legal
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">Website Terms of Use</h1>
          <p className="mt-3 text-sm text-zinc-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-zinc-700 leading-relaxed">
            By using <strong>twowheelobsession.com.au</strong> you agree to these terms. They
            govern the website only — sales, finance, insurance and service contracts have their
            own written terms supplied at the point of sale.
          </p>

          <Section title="1. Information accuracy">
            <p>
              We work hard to keep bike specs, prices, photos and availability accurate, but data
              flows in from manufacturers (Yamaha, Suzuki, CFMOTO) and stock changes daily.
              Anything on this site is indicative — confirm with us before you commit. We reserve
              the right to correct errors and update information without notice.
            </p>
          </Section>

          <Section title="2. Pricing">
            <p>
              Prices are shown in Australian dollars and include GST unless stated otherwise.
              &quot;Ride away&quot; or &quot;drive away&quot; means inclusive of on-road costs as
              shown; otherwise on-road costs are extra. Offers are subject to availability and
              manufacturer terms. We may change prices at any time.
            </p>
          </Section>

          <Section title="3. Used motorcycle listings">
            <p>
              Used bikes are sold subject to a written sale agreement signed at the dealership.
              The website listing is informational only; condition reports, mechanical inspection
              and any warranty are documented separately at sale.
            </p>
          </Section>

          <Section title="4. Yamaha OEM Parts Finder">
            <p>
              The parts finder tool is supplied by EPC Online and gives indicative part numbers
              and pricing for Yamaha OEM parts. Final price, availability and fitment are
              confirmed when you place an order with our workshop.
            </p>
          </Section>

          <Section title="5. Forms and enquiries">
            <p>
              When you submit an enquiry or service request, we collect your information per our{" "}
              <Link href="/privacy-policy" className="underline">
                privacy policy
              </Link>
              . We aim to respond within one business day, but please call us for anything urgent.
            </p>
          </Section>

          <Section title="6. Intellectual property">
            <p>
              The site's content, design, code and trade marks are owned by Two Wheel Obsession or
              our licensors (manufacturer logos, photography). You may use the site for personal,
              non-commercial purposes. Commercial use, scraping or republishing content requires
              written permission.
            </p>
          </Section>

          <Section title="7. Third-party links">
            <p>
              The site links to third-party providers (manufacturers, finance, listing sites). We
              don't control those sites and aren't responsible for their content or terms.
            </p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>
              We provide the site &quot;as is&quot; and to the extent permitted by Australian
              Consumer Law, exclude liability for any indirect or consequential losses arising
              from your use of the site. Nothing in these terms limits any rights you have under
              the Australian Consumer Law.
            </p>
          </Section>

          <Section title="9. Changes to these terms">
            <p>
              We may update these terms from time to time. The &quot;last updated&quot; date at
              the top tells you when. Material changes will be flagged on the website.
            </p>
          </Section>

          <Section title="10. Governing law">
            <p>These terms are governed by the laws of New South Wales, Australia.</p>
          </Section>

          <Section title="11. Contact">
            <p>
              <strong>Two Wheel Obsession</strong>
              <br />
              169 Manns Road, West Gosford NSW 2250
              <br />
              <a href="tel:+61243319007" className="underline">
                (02) 4331 9007
              </a>
              <br />
              <a href="mailto:enquiries@twowheelobsession.com.au" className="underline">
                enquiries@twowheelobsession.com.au
              </a>
            </p>
          </Section>

          <p className="mt-12 text-sm text-zinc-500">
            These are general website terms. They are not a substitute for legal advice — if you
            have specific legal questions please consult a lawyer.
          </p>
        </div>
      </section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      <div className="mt-3 text-zinc-700 leading-relaxed [&>p]:mt-3">{children}</div>
    </section>
  )
}
