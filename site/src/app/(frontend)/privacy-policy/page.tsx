import Link from "next/link"

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Two Wheel Obsession collects, uses and protects your personal information.",
}

const LAST_UPDATED = "29 April 2026"

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <section className="bg-zinc-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Legal
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-3 text-sm text-zinc-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-14 prose prose-zinc max-w-none">
          <p className="text-zinc-700 leading-relaxed">
            Two Wheel Obsession (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) takes your
            privacy seriously. This policy explains what personal information we collect, how we
            use it, and your rights under the Australian{" "}
            <em>Privacy Act 1988 (Cth)</em> and the Australian Privacy Principles.
          </p>

          <Section title="1. What we collect">
            <p>We collect information you give us directly when you:</p>
            <ul>
              <li>Submit an enquiry, parts request, or service request through the website</li>
              <li>Purchase a motorcycle, parts, or service</li>
              <li>Contact us by phone, email, or in person</li>
              <li>Sign up for marketing communications</li>
            </ul>
            <p>
              The information typically includes your name, email, phone number, address, and
              vehicle details (make, model, registration, VIN).
            </p>
          </Section>

          <Section title="2. How we use it">
            <ul>
              <li>To respond to your enquiry, quote, or service request</li>
              <li>To process orders, registrations, finance applications and warranty claims</li>
              <li>To keep records as required by Australian motor-dealer regulations</li>
              <li>
                To send you service reminders or recall notices, where relevant to your bike
              </li>
              <li>
                With your consent, to send you marketing communications (you can opt out at any
                time)
              </li>
            </ul>
          </Section>

          <Section title="3. Who we share it with">
            <p>
              We don't sell your personal information. We share it only with parties needed to
              deliver what you've asked for:
            </p>
            <ul>
              <li>
                Manufacturers (Yamaha, Suzuki, CFMOTO) for warranty registrations and recalls
              </li>
              <li>Finance and insurance providers when you apply for finance through us</li>
              <li>
                Listing platforms (e.g. bikesales.com.au) when you've listed a bike with us
              </li>
              <li>
                Government bodies (NSW Roads & Maritime Services) for registration and CTP
              </li>
              <li>Our IT, hosting and payment providers under appropriate data protections</li>
            </ul>
          </Section>

          <Section title="4. Storage and security">
            <p>
              Your information is stored on secure cloud infrastructure within Australia or
              equivalent-protected jurisdictions. We use industry-standard protections (encryption
              in transit, role-based access control). We retain personal information only for as
              long as needed to deliver the service or to comply with legal record-keeping
              obligations.
            </p>
          </Section>

          <Section title="5. Your rights">
            <p>You can ask us to:</p>
            <ul>
              <li>Show you what personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>
                Delete your information, where we're not legally required to keep it (e.g.
                completed sale records)
              </li>
              <li>Stop sending you marketing</li>
            </ul>
            <p>
              Email{" "}
              <a href="mailto:enquiries@twowheelobsession.com.au" className="underline">
                enquiries@twowheelobsession.com.au
              </a>{" "}
              and we'll come back within 30 days.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use only the cookies required for the website to function (e.g. keeping you
              signed into the staff admin area). We don't run third-party advertising trackers or
              analytics that profile individual visitors.
            </p>
          </Section>

          <Section title="7. Complaints">
            <p>
              If you think we've mishandled your information, contact us first. If you're not
              happy with our response, you can complain to the{" "}
              <a
                href="https://www.oaic.gov.au/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Office of the Australian Information Commissioner
              </a>
              .
            </p>
          </Section>

          <Section title="8. Contact us">
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
            This policy is provided for general information. We&rsquo;ll update it from time to
            time — the &quot;last updated&quot; date at the top tells you when.{" "}
            <Link href="/contact-us" className="underline">
              Get in touch
            </Link>{" "}
            with any questions.
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
      <div className="mt-3 text-zinc-700 leading-relaxed [&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mt-1">
        {children}
      </div>
    </section>
  )
}
