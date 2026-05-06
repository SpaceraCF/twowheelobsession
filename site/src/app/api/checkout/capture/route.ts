import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"

import { generateOrderNumber, validateCheckoutInput } from "@/lib/cart/server"
import { capturePayPalOrder, getPayPalConfig } from "@/lib/paypal/client"

// Captures a PayPal order, verifies the captured amount matches what
// the customer was expecting, writes an Order to Payload, and lets
// Payload's afterChange hook fire the email to PARTS_ORDER_NOTIFY_EMAIL.
//
// Body shape: { paypalOrderId, customer, shippingMethod, shippingAddress?, lineItems }
//
// Re-validates the cart server-side rather than trusting the payload —
// a malicious client can't bypass the price check because PayPal echoes
// back the actual captured amount and we compare to our recomputed total.

export async function POST(request: Request) {
  const cfg = getPayPalConfig()
  if (!cfg.ok) {
    return NextResponse.json(
      { error: "Checkout is not yet configured." },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const b = body as Record<string, unknown> | null
  const paypalOrderId = String(b?.paypalOrderId ?? "").trim()
  if (!paypalOrderId) {
    return NextResponse.json({ error: "Missing paypalOrderId." }, { status: 400 })
  }

  const v = validateCheckoutInput(body)
  if (!v.ok) {
    return NextResponse.json({ error: v.error, field: v.field }, { status: 400 })
  }

  const captureResult = await capturePayPalOrder(paypalOrderId)
  if (!captureResult.ok) {
    return NextResponse.json(
      {
        error: "Payment couldn't be captured. Please try again or call (02) 4331 9007.",
        detail: process.env.NODE_ENV === "production" ? undefined : captureResult.message,
      },
      { status: 502 },
    )
  }

  // Defence: confirm PayPal captured the amount we expected. PayPal
  // returns it as a string ("47.95"); compare numerically with a tiny
  // tolerance for floating-point.
  const captured = Number(captureResult.capturedAmount ?? 0)
  if (!Number.isFinite(captured) || Math.abs(captured - v.total) > 0.01) {
    return NextResponse.json(
      {
        error: "Captured amount didn't match the order total. Please contact us — your card was NOT charged twice.",
      },
      { status: 409 },
    )
  }

  // Find the payer email PayPal echoed (only available on full capture
  // detail; we passed `raw` through for this).
  const payerEmail =
    (captureResult.raw as { payer?: { email_address?: string } } | undefined)?.payer?.email_address ??
    null

  const orderNumber = generateOrderNumber()
  const lineItemsForDoc = v.input.lineItems.map((li) => ({
    sku: li.sku,
    name: li.name,
    qty: li.qty,
    unitPrice: li.unitPrice,
    lineTotal: Math.round(li.unitPrice * li.qty * 100) / 100,
  }))

  try {
    const payload = await getPayload({ config })
    const created = await payload.create({
      collection: "orders",
      data: {
        orderNumber,
        status: "paid",
        shippingMethod: v.input.shippingMethod,
        customerName: v.input.customer.name,
        customerEmail: v.input.customer.email,
        customerPhone: v.input.customer.phone,
        addressLine1: v.input.shippingAddress?.addressLine1,
        addressLine2: v.input.shippingAddress?.addressLine2,
        suburb: v.input.shippingAddress?.suburb,
        state: v.input.shippingAddress?.state,
        postcode: v.input.shippingAddress?.postcode,
        lineItems: lineItemsForDoc,
        subtotal: v.subtotal,
        shipping: v.shipping,
        total: v.total,
        paypalEnv: process.env.PAYPAL_ENV ?? "sandbox",
        paypalOrderId,
        paypalCaptureId: captureResult.captureId,
        paypalCaptureStatus: captureResult.captureStatus,
        paypalPayerEmail: payerEmail ?? undefined,
      } as never,
    })

    return NextResponse.json({
      ok: true,
      orderNumber: created.orderNumber as string,
      orderId: created.id,
    })
  } catch (err) {
    // Payment captured but Payload write failed — flag explicitly so
    // staff know to look up the PayPal capture and reconcile manually.
    console.error("[checkout/capture] Payload write failed AFTER successful capture", err)
    return NextResponse.json(
      {
        error:
          "We received your payment but couldn't save the order. Please call (02) 4331 9007 with your PayPal receipt — we'll sort it out.",
        paypalOrderId,
        paypalCaptureId: captureResult.captureId,
      },
      { status: 500 },
    )
  }
}
