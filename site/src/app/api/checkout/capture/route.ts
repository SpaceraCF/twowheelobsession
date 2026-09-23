import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"

import { generateOrderNumber, priceCheckoutInput, validateCheckoutInput } from "@/lib/cart/server"
import { verifyCheckoutToken } from "@/lib/cart/checkout-token"
import { capturePayPalOrder, getPayPalConfig, getPayPalOrder } from "@/lib/paypal/client"

// Captures a PayPal order, verifies the captured amount matches what
// the customer was expecting, writes an Order to Payload, and lets
// Payload's afterChange hook fire the email to PARTS_ORDER_NOTIFY_EMAIL.
//
// Body shape: { paypalOrderId, checkoutToken, customer, shippingMethod, shippingAddress?, lineItems }
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
  if (!/^[A-Z0-9]{10,32}$/i.test(paypalOrderId)) {
    return NextResponse.json({ error: "Invalid paypalOrderId." }, { status: 400 })
  }

  const parsed = validateCheckoutInput(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, field: parsed.field }, { status: 400 })
  }
  const v = await priceCheckoutInput(parsed)
  if (!v.ok) {
    return NextResponse.json({ error: v.error, field: v.field }, { status: v.status ?? 400 })
  }

  const internalReference = verifyCheckoutToken(b?.checkoutToken, v, paypalOrderId, cfg.clientSecret)
  if (!internalReference) {
    return NextResponse.json(
      { error: "Checkout details changed or expired. Start checkout again." },
      { status: 409 },
    )
  }

  // Verify the signed checkout identity as well as its current server prices.
  const paypalOrder = await getPayPalOrder(paypalOrderId)
  if (!paypalOrder.ok) {
    return NextResponse.json({ error: "Could not verify the PayPal order." }, { status: 502 })
  }
  const expectedItems = v.input.lineItems
    .map((item) => JSON.stringify([item.sku, item.name.slice(0, 127), String(item.qty), item.unitPrice.toFixed(2), "AUD"]))
    .sort()
  const actualItems = paypalOrder.items
    .map((item) => JSON.stringify([item.sku, item.name, item.quantity, Number(item.unit_amount?.value).toFixed(2), item.unit_amount?.currency_code]))
    .sort()
  const orderMatches =
    paypalOrder.orderId === paypalOrderId &&
    paypalOrder.status === "APPROVED" &&
    paypalOrder.purchaseUnitCount === 1 &&
    paypalOrder.internalReference === internalReference &&
    paypalOrder.currency === "AUD" &&
    Number.isFinite(Number(paypalOrder.amount)) &&
    Math.round(Number(paypalOrder.amount) * 100) === Math.round(v.total * 100) &&
    expectedItems.length === actualItems.length &&
    expectedItems.every((item, index) => item === actualItems[index])
  if (!orderMatches) {
    return NextResponse.json(
      { error: "Cart details no longer match the approved PayPal order. Start checkout again." },
      { status: 409 },
    )
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
  if (captureResult.orderId !== paypalOrderId || captureResult.status !== "COMPLETED" ||
      captureResult.captureStatus !== "COMPLETED" || !captureResult.captureId ||
      captureResult.capturedCurrency !== "AUD" || !Number.isFinite(captured) ||
      Math.round(captured * 100) !== Math.round(v.total * 100)) {
    return NextResponse.json(
      {
        error: "PayPal has not confirmed a completed payment for this order. Please contact us with your PayPal receipt before trying again.",
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
