import { CheckoutFlow } from "@/components/CheckoutFlow"

export const metadata = {
  title: "Checkout — Yamaha Parts Australia",
  description: "Pay for your Yamaha parts via PayPal.",
}

// Server component shell. Passes the PayPal client_id (public — safe
// to embed) and a configured-or-not flag to the client component, so
// the client doesn't need to import server-only env access.
export default function CheckoutPage() {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""
  const paypalConfigured =
    Boolean(paypalClientId) && !paypalClientId.startsWith("PLACEHOLDER_")
  const paypalEnv = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase()

  return (
    <section className="bg-zinc-50">
      <div className="max-w-[1100px] mx-auto px-6 py-12 md:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-600">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
          Pay for your Yamaha parts
        </h1>
        <p className="mt-3 text-zinc-700 max-w-xl leading-relaxed">
          Prices include GST. After your payment, we'll pick and pack your
          order — most ship within one business day. Questions? Call{" "}
          <a href="tel:+61243319007" className="font-semibold text-red-600 hover:underline">
            (02) 4331 9007
          </a>
          .
        </p>

        <div className="mt-10">
          <CheckoutFlow
            paypalClientId={paypalConfigured ? paypalClientId : null}
            paypalEnv={paypalEnv}
          />
        </div>
      </div>
    </section>
  )
}
