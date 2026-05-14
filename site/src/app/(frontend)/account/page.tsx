import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentCustomer } from "@/lib/auth/customer"

export const metadata = { title: "Overview" }

export default async function AccountOverviewPage() {
  const customer = await getCurrentCustomer()
  // The chrome shows the "please sign in" state, but the overview
  // tiles assume a logged-in customer — bounce to login when not.
  if (!customer) redirect("/account/login")

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-700">
        Quick links to manage your account. More tools (saved bikes, order
        history, service booking) are landing here as we build them out.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Tile
          title="Your profile"
          body="Name, contact details, default shipping address."
          href="/account/profile"
          cta="Edit profile"
        />
        <Tile
          title="Need help?"
          body="Call (02) 4331 9007 or send an enquiry — we read every message."
          href="/contact-us"
          cta="Contact us"
        />
        <Tile
          title="Saved bikes"
          body="Coming soon — add your bike(s) for faster part lookups and service booking."
          cta="Coming soon"
          disabled
        />
        <Tile
          title="Order history"
          body="Coming soon — every part you've ordered from us, in one place."
          cta="Coming soon"
          disabled
        />
      </div>
    </div>
  )
}

function Tile({
  title,
  body,
  href,
  cta,
  disabled = false,
}: {
  title: string
  body: string
  href?: string
  cta: string
  disabled?: boolean
}) {
  return (
    <div
      className={`bg-white border ${
        disabled ? "border-zinc-200" : "border-zinc-200 hover:border-zinc-400"
      } rounded p-5`}
    >
      <h3 className="text-base font-bold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{body}</p>
      <div className="mt-4">
        {disabled || !href ? (
          <span className="inline-flex h-9 items-center px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {cta}
          </span>
        ) : (
          <Link
            href={href}
            className="inline-flex h-9 items-center px-3 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black"
          >
            {cta}
          </Link>
        )}
      </div>
    </div>
  )
}
