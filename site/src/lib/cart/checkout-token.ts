import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import type { CheckoutValidation } from "./server"

type PricedCheckout = Extract<CheckoutValidation, { ok: true }>
const TOKEN_LIFETIME_MS = 30 * 60 * 1000

function contextHash(checkout: PricedCheckout): string {
  const { customer, shippingMethod, shippingAddress, lineItems } = checkout.input
  // Explicit fields and JSON arrays avoid ambiguous delimiter concatenation.
  return createHash("sha256").update(JSON.stringify([
    customer.name, customer.email, customer.phone, shippingMethod,
    shippingAddress?.addressLine1, shippingAddress?.addressLine2,
    shippingAddress?.suburb, shippingAddress?.state, shippingAddress?.postcode,
    lineItems.map((item) => JSON.stringify([
      item.sku, item.name, item.qty, item.unitPrice, item.bikeContext,
    ])).sort(),
    checkout.subtotal, checkout.shipping, checkout.total,
  ])).digest("base64url")
}

function signature(payload: string, secret: string): Buffer {
  // Reuse the already-required server-only PayPal secret, with domain separation.
  return createHmac("sha256", secret).update(`checkout-v1:${payload}`).digest()
}

export function createCheckoutToken(
  checkout: PricedCheckout, orderId: string, reference: string, secret: string,
  now = Date.now(),
): string {
  const payload = Buffer.from(JSON.stringify([
    1, orderId, reference, contextHash(checkout), now + TOKEN_LIFETIME_MS,
  ])).toString("base64url")
  return `${payload}.${signature(payload, secret).toString("base64url")}`
}

/** Authenticate the originating checkout before any payment is captured. */
export function verifyCheckoutToken(
  token: unknown, checkout: PricedCheckout, orderId: string, secret: string,
  now = Date.now(),
): string | null {
  if (typeof token !== "string" || token.length > 2048) return null
  const parts = token.split(".")
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return null
  try {
    const actual = Buffer.from(parts[1], "base64url")
    const expected = signature(parts[0], secret)
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const data: unknown = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"))
    if (!Array.isArray(data) || data.length !== 5) return null
    const [version, boundOrderId, reference, hash, expires] = data
    if (version !== 1 || boundOrderId !== orderId || typeof reference !== "string" ||
        !reference || hash !== contextHash(checkout) || !Number.isSafeInteger(expires) ||
        expires <= now || expires > now + TOKEN_LIFETIME_MS) return null
    return reference
  } catch {
    return null
  }
}
