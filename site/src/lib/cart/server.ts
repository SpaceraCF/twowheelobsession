// Server-side cart helpers used by both checkout endpoints.
// Shared types live in `./types`; the helpers here are server-only
// (run during the API request, never bundled into the client).

import {
  type CartLineItem,
  type ShippingMethod,
  shippingCostFor,
} from "./types"

const VALID_SHIPPING: ShippingMethod[] = ["au-flat", "pickup"]

const VALID_AU_STATES = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"])

export type CheckoutCustomer = {
  name: string
  email: string
  phone: string
}

export type CheckoutAddress = {
  addressLine1: string
  addressLine2?: string
  suburb: string
  state: string
  postcode: string
}

export type CheckoutInput = {
  customer: CheckoutCustomer
  shippingMethod: ShippingMethod
  shippingAddress?: CheckoutAddress
  lineItems: CartLineItem[]
}

export type CheckoutValidation =
  | { ok: true; input: CheckoutInput; subtotal: number; shipping: number; total: number }
  | { ok: false; error: string; field?: string }

export function validateCheckoutInput(raw: unknown): CheckoutValidation {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Invalid request body." }
  }
  const r = raw as Record<string, unknown>

  // Customer
  const c = r.customer as Record<string, unknown> | undefined
  if (!c) return { ok: false, error: "Customer details required.", field: "customer" }
  const name = String(c.name ?? "").trim()
  const email = String(c.email ?? "").trim()
  const phone = String(c.phone ?? "").trim()
  if (!name) return { ok: false, error: "Name required.", field: "customer.name" }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Valid email required.", field: "customer.email" }
  }
  if (!phone || phone.replace(/\D/g, "").length < 6) {
    return { ok: false, error: "Phone required.", field: "customer.phone" }
  }

  // Shipping method
  const shippingMethod = String(r.shippingMethod ?? "") as ShippingMethod
  if (!VALID_SHIPPING.includes(shippingMethod)) {
    return { ok: false, error: "Pick a shipping method.", field: "shippingMethod" }
  }

  // Address (only required for au-flat)
  let shippingAddress: CheckoutAddress | undefined
  if (shippingMethod === "au-flat") {
    const a = r.shippingAddress as Record<string, unknown> | undefined
    if (!a) return { ok: false, error: "Shipping address required.", field: "shippingAddress" }
    const addressLine1 = String(a.addressLine1 ?? "").trim()
    const addressLine2 = String(a.addressLine2 ?? "").trim()
    const suburb = String(a.suburb ?? "").trim()
    const state = String(a.state ?? "").trim().toUpperCase()
    const postcode = String(a.postcode ?? "").trim()
    if (!addressLine1) return { ok: false, error: "Street address required.", field: "shippingAddress.addressLine1" }
    if (!suburb) return { ok: false, error: "Suburb required.", field: "shippingAddress.suburb" }
    if (!VALID_AU_STATES.has(state)) {
      return { ok: false, error: "Pick a valid Australian state.", field: "shippingAddress.state" }
    }
    if (!/^\d{4}$/.test(postcode)) {
      return { ok: false, error: "Postcode must be 4 digits.", field: "shippingAddress.postcode" }
    }
    shippingAddress = { addressLine1, addressLine2: addressLine2 || undefined, suburb, state, postcode }
  }

  // Line items
  if (!Array.isArray(r.lineItems) || r.lineItems.length === 0) {
    return { ok: false, error: "Cart is empty.", field: "lineItems" }
  }
  const lineItems: CartLineItem[] = []
  for (const it of r.lineItems as unknown[]) {
    if (typeof it !== "object" || it === null) {
      return { ok: false, error: "Invalid line item.", field: "lineItems" }
    }
    const li = it as Record<string, unknown>
    const sku = String(li.sku ?? "").trim()
    const itemName = String(li.name ?? "").trim()
    const unitPrice = Number(li.unitPrice)
    const qty = Math.floor(Number(li.qty))
    if (!sku || !itemName) return { ok: false, error: "Line item missing sku/name.", field: "lineItems" }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return { ok: false, error: `Invalid price for ${sku}.`, field: "lineItems" }
    }
    if (!Number.isFinite(qty) || qty < 1) {
      return { ok: false, error: `Invalid qty for ${sku}.`, field: "lineItems" }
    }
    lineItems.push({
      sku,
      name: itemName,
      unitPrice: round2(unitPrice),
      qty,
      bikeContext: typeof li.bikeContext === "string" && li.bikeContext.trim() ? li.bikeContext.trim() : undefined,
    })
  }

  const subtotal = round2(lineItems.reduce((acc, li) => acc + li.unitPrice * li.qty, 0))
  const shipping = shippingCostFor(shippingMethod)
  const total = round2(subtotal + shipping)

  return {
    ok: true,
    input: {
      customer: { name, email, phone },
      shippingMethod,
      shippingAddress,
      lineItems,
    },
    subtotal,
    shipping,
    total,
  }
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function generateOrderNumber(): string {
  // YPA-<7 random alphanumeric chars>. Simple, opaque, easy to read
  // out over a phone call. Uniqueness enforced by Payload's `unique:
  // true` index — collisions are effectively impossible at our volume.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I
  let s = ""
  for (let i = 0; i < 7; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `YPA-${s}`
}
