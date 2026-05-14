import Link from "next/link"

import type { CurrentCustomer } from "@/lib/auth/customer"

import { LogoutButton } from "./LogoutButton"

const NAV = [
  { label: "Overview", href: "/account" },
  { label: "Profile", href: "/account/profile" },
  // Bikes + Orders pages land in Checkpoint B; the links are here so
  // the chrome looks complete from day 1 — Checkpoint B replaces the
  // routes.
  // { label: "My bikes", href: "/account/bikes" },
  // { label: "Orders", href: "/account/orders" },
]

/**
 * Outer chrome shown on every /account/* page. Logged-out visitors
 * see the same hero header but with a "Sign in" CTA instead of the
 * left-side nav.
 */
export function AccountChrome({
  customer,
  children,
}: {
  customer: { firstName?: string; email: string } | null
  children: React.ReactNode
}) {
  return (
    <>
      <section className="bg-zinc-900 text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-10 md:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            My account
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">
            {customer
              ? `Welcome back${customer.firstName ? `, ${customer.firstName}` : ""}.`
              : "Your account"}
          </h1>
          {customer ? (
            <p className="mt-2 text-sm text-zinc-300">
              Signed in as {customer.email}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-300">
              Sign in to view your orders, manage your bikes, and book a
              service.
            </p>
          )}
        </div>
      </section>

      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-[1100px] mx-auto px-6 py-12 grid gap-10 md:grid-cols-[200px_1fr]">
          {customer ? (
            <aside>
              <nav className="text-sm font-semibold space-y-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded text-zinc-900 hover:bg-zinc-100"
                  >
                    {item.label}
                  </Link>
                ))}
                <LogoutButton />
              </nav>
            </aside>
          ) : (
            <div />
          )}
          <main>{children}</main>
        </div>
      </section>
    </>
  )
}
