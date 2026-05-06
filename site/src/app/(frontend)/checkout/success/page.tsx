import { redirect } from "next/navigation"

// Mirrors /checkout — preserves the ?order=YPA-... query so the
// success page can show the order ref. PayPal redirects land here on
// the staging URL during dev; on the parts host the proxy rewrites
// before this file is reached.

type SuccessParams = Promise<{ order?: string }>

export const dynamic = "force-dynamic"

export default async function CheckoutSuccessRedirect({
  searchParams,
}: {
  searchParams: SuccessParams
}) {
  const sp = await searchParams
  const target = sp.order
    ? `/parts/checkout/success?order=${encodeURIComponent(sp.order)}`
    : "/parts/checkout/success"
  redirect(target)
}
