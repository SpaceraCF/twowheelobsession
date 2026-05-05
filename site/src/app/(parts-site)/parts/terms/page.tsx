import Link from "next/link"

export const metadata = {
  title: "Website Terms of Use",
  description:
    "Terms governing the use of the Yamaha Parts Australia website. Operated by Two Wheel Obsession.",
}

const LAST_UPDATED = "5 May 2026"

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="bg-[#0d1f4d] text-white">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            Legal
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">Website Terms of Use</h1>
          <p className="mt-3 text-sm text-white/60">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-zinc-700 leading-relaxed">
            By using <strong>yamahapartsaustralia.com.au</strong> you agree
            to these terms. The site is operated by{" "}
            <strong>Two Wheel Obsession</strong>, an authorised Yamaha
            dealer in West Gosford, NSW. These terms govern the website only
            — orders are completed under separate sale terms confirmed at
            time of order.
          </p>

          <Section title="1. Information accuracy">
            <p>
              Part numbers, fitment, and indicative pricing are supplied by
              the EPC Online catalogue and Yamaha Australia. Stock and final
              pricing are confirmed at time of order. We reserve the right to
              correct errors and update information without notice.
            </p>
          </Section>

          <Section title="2. Pricing">
            <p>
              Prices are shown in Australian dollars and include GST unless
              stated otherwise. Shipping is quoted at order confirmation.
              Offers are subject to availability and Yamaha pricing changes.
            </p>
          </Section>

          <Section title="3. Yamaha OEM Parts Finder">
            <p>
              The parts finder tool is supplied by EPC Online and gives
              indicative part numbers and pricing for Yamaha OEM parts.
              Final price, availability and fitment are confirmed when you
              place an order with us.
            </p>
          </Section>

          <Section title="4. Forms and enquiries">
            <p>
              When you submit a parts enquiry, we collect your information
              per our{" "}
              <Link href="/privacy-policy" className="underline">
                privacy policy
              </Link>
              . We aim to respond within one business day.
            </p>
          </Section>

          <Section title="5. Intellectual property">
            <p>
              The site's content, design, and code are owned by Two Wheel
              Obsession or our licensors. Yamaha trade marks (Yamaha,
              Yamalube, GYTR, etc.) are owned by Yamaha Motor Co. and used
              under our authorised dealer agreement.
            </p>
          </Section>

          <Section title="6. Limitation of liability">
            <p>
              We provide the site &quot;as is&quot; and to the extent
              permitted by Australian Consumer Law, exclude liability for any
              indirect or consequential losses arising from your use of the
              site. Nothing in these terms limits any rights you have under
              the Australian Consumer Law.
            </p>
          </Section>

          <Section title="7. Governing law">
            <p>These terms are governed by the laws of New South Wales, Australia.</p>
          </Section>

          <Section title="8. Contact">
            <p>
              <strong>Two Wheel Obsession</strong>
              <br />
              169 Manns Road, West Gosford NSW 2250
              <br />
              <a href="tel:+61243319007" className="underline">
                (02) 4331 9007
              </a>
              <br />
              <a href="mailto:info@twowheelobsession.com.au" className="underline">
                info@twowheelobsession.com.au
              </a>
            </p>
          </Section>

          <p className="mt-12 text-sm text-zinc-500">
            These are general website terms. They are not a substitute for
            legal advice.
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
