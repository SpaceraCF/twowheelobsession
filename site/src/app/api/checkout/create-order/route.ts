import { NextResponse } from "next/server"

import { validateCheckoutInput } from "@/lib/cart/server"
import { createPayPalOrder, getPayPalConfig } from "@/lib/paypal/client"

// Server endpoint that validates the cart + customer details, then
// creates a PayPal order via PayPal's Orders v2 API. Returns the
// PayPal order ID — the client passes it to PayPal's Smart Buttons
// which open the PayPal payment popup.
//
// PayPal credentials are guarded in `lib/paypal/client.ts`: while
// they're still placeholders this endpoint returns a 503 with a clear
// message, so we can build + test the rest of the flow without real
// keys.

export async function POST(request: Request) {
  // Reject if PayPal isn't configured at all — covers the "I deployed
  // before swapping placeholders" failure mode loudly.
  const cfg = getPayPalConfig()
  if (!cfg.ok) {
    return NextResponse.json(
      { error: "Checkout is not yet configured. Please call (02) 4331 9007 to order." },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const v = validateCheckoutInput(body)
  if (!v.ok) {
    return NextResponse.json({ error: v.error, field: v.field }, { status: 400 })
  }

  // The internal reference is what we'll match the capture against.
  // PayPal stores it as `custom_id` on the order and echoes it back
  // in the capture response, so we don't need any server-side session
  // state between create and capture.
  const internalReference = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const result = await createPayPalOrder({
    lineItems: v.input.lineItems,
    subtotal: v.subtotal,
    shipping: v.shipping,
    total: v.total,
    internalReference,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          "Could not start PayPal checkout. Please try again, or call (02) 4331 9007.",
        detail: process.env.NODE_ENV === "production" ? undefined : result.message,
      },
      { status: 502 },
    )
  }

  return NextResponse.json({
    paypalOrderId: result.orderId,
    internalReference,
  })
}
