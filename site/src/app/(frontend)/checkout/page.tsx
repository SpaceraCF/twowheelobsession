import { redirect } from "next/navigation"

// /checkout only "exists" on the parts host (yamahapartsaustralia.com.au),
// where proxy.ts rewrites it to /parts/checkout server-side. On any
// other host (the Render staging URL during dev, or the main TWO
// domain post-cutover) we redirect to the canonical parts-site path
// so cart-drawer "Checkout" clicks work everywhere.

export const dynamic = "force-static"

export default function CheckoutRedirect() {
  redirect("/parts/checkout")
}
