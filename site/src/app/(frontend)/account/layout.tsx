import type { Metadata } from "next"

import { AccountChrome } from "@/components/account/AccountChrome"
import { getCurrentCustomer } from "@/lib/auth/customer"

export const metadata: Metadata = {
  title: {
    default: "My account | Two Wheel Obsession",
    template: "%s | My account | Two Wheel Obsession",
  },
  // Don't index customer-only pages — login forms etc. are
  // SEO-noise and the dashboard is private anyway.
  robots: { index: false, follow: false },
}

// Every customer-portal page is server-rendered per request because
// auth state lives in cookies. `force-dynamic` keeps the build
// happy without prerender attempts.
export const dynamic = "force-dynamic"

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const customer = await getCurrentCustomer()
  return <AccountChrome customer={customer}>{children}</AccountChrome>
}
