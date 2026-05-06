// Shared cart types — used by the Cart context, drawer, checkout
// page, server endpoints, and the EPC iframe bridge. Keeping the
// shape narrow (sku/name/qty/price only) means anything that produces
// a line item — EPC bridge today, Evopos accessories tomorrow — can
// hand back the same envelope.

export type CartLineItem = {
  /** Yamaha part number / Evopos SKU. Unique per cart. */
  sku: string
  /** Display name customers see in the cart. */
  name: string
  /** AUD, GST-inclusive (Yamaha RRP from EPC, or accessory price from Evopos). */
  unitPrice: number
  /** Customer-buying quantity (NOT "qty per assembly" from the EPC table). */
  qty: number
  /** Optional extra context — useful for staff diagnosing a fitment query. */
  bikeContext?: string
}

export type ShippingMethod = "au-flat" | "pickup"

export const SHIPPING_OPTIONS: Array<{ value: ShippingMethod; label: string; cost: number; description: string }> = [
  {
    value: "au-flat",
    label: "Australia-wide flat rate",
    cost: 12,
    description: "A$12 — most orders ship within one business day.",
  },
  {
    value: "pickup",
    label: "Pick up in West Gosford",
    cost: 0,
    description: "Free — collect from the workshop, 169 Manns Road West Gosford NSW.",
  },
]

export function shippingCostFor(method: ShippingMethod): number {
  return SHIPPING_OPTIONS.find((o) => o.value === method)?.cost ?? 0
}

export function calcSubtotal(items: CartLineItem[]): number {
  return items.reduce((acc, li) => acc + li.unitPrice * li.qty, 0)
}

export function calcItemCount(items: CartLineItem[]): number {
  return items.reduce((acc, li) => acc + li.qty, 0)
}

export function fmtAud(n: number): string {
  return `A$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// postMessage envelope used by the EPC iframe bridge. Type-tag every
// message so we don't react to random messages that wandered into
// `window.message` from elsewhere.
export const CART_MESSAGE_TYPE = "ypa:cart:add" as const

export type CartAddMessage = {
  type: typeof CART_MESSAGE_TYPE
  payload: CartLineItem
}

export function isCartAddMessage(data: unknown): data is CartAddMessage {
  if (typeof data !== "object" || data === null) return false
  const d = data as Record<string, unknown>
  if (d.type !== CART_MESSAGE_TYPE) return false
  if (typeof d.payload !== "object" || d.payload === null) return false
  const p = d.payload as Record<string, unknown>
  return (
    typeof p.sku === "string" &&
    typeof p.name === "string" &&
    typeof p.unitPrice === "number" &&
    typeof p.qty === "number" &&
    p.qty > 0
  )
}
