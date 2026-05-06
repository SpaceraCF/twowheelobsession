// PayPal REST API client for the Yamaha Parts Australia checkout.
// Uses Orders v2 (https://developer.paypal.com/docs/api/orders/v2/).
//
// Two app credentials are needed: sandbox for dev, live for prod.
// `PAYPAL_ENV` selects which API base URL we hit; `PAYPAL_CLIENT_ID`
// and `PAYPAL_CLIENT_SECRET` are the corresponding app's keys.
//
// Placeholder guard: if either credential is still the placeholder
// value (or empty), the helpers below return a typed error instead of
// hitting the API. Lets us build the whole checkout flow against
// stubs without accidentally shipping a broken-secret deploy.

const PLACEHOLDER_PREFIX = "PLACEHOLDER_"

export type PayPalConfigError =
  | { ok: false; reason: "missing_credentials"; message: string }

export type PayPalConfig =
  | { ok: true; baseUrl: string; clientId: string; clientSecret: string }
  | PayPalConfigError

export function getPayPalConfig(): PayPalConfig {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? ""
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? ""
  const env = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase()

  if (
    !clientId ||
    !clientSecret ||
    clientId.startsWith(PLACEHOLDER_PREFIX) ||
    clientSecret.startsWith(PLACEHOLDER_PREFIX)
  ) {
    return {
      ok: false,
      reason: "missing_credentials",
      message:
        "PayPal credentials not configured. Set PAYPAL_CLIENT_ID and " +
        "PAYPAL_CLIENT_SECRET (sandbox or live) in the environment.",
    }
  }

  const baseUrl =
    env === "live" || env === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com"

  return { ok: true, baseUrl, clientId, clientSecret }
}

// Cache the OAuth bearer token for ~8 minutes. PayPal tokens last
// ~32400s (~9 hours) but are cheap to refresh; a short cache keeps
// memory pressure trivial and survives typical serverless lambda
// lifetimes.
let tokenCache: { token: string; expiresAt: number } | null = null

async function getAccessToken(cfg: { baseUrl: string; clientId: string; clientSecret: string }) {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now) return tokenCache.token

  const auth = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64")
  const res = await fetch(`${cfg.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`PayPal OAuth failed (${res.status}): ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = {
    token: data.access_token,
    expiresAt: now + Math.min(data.expires_in * 1000, 8 * 60 * 1000),
  }
  return data.access_token
}

export type PayPalLineItem = {
  sku: string
  name: string
  unitPrice: number
  qty: number
}

export type CreateOrderInput = {
  lineItems: PayPalLineItem[]
  /** AUD subtotal (sum of qty * unitPrice). */
  subtotal: number
  /** AUD shipping line — 0 for in-store pickup. */
  shipping: number
  /** AUD total = subtotal + shipping. */
  total: number
  /** Internal reference, stored on the PayPal order as custom_id. */
  internalReference: string
}

export async function createPayPalOrder(input: CreateOrderInput) {
  const cfg = getPayPalConfig()
  if (!cfg.ok) return cfg

  const token = await getAccessToken(cfg)

  const fmt = (n: number) => n.toFixed(2)

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: input.internalReference,
        amount: {
          currency_code: "AUD",
          value: fmt(input.total),
          breakdown: {
            item_total: { currency_code: "AUD", value: fmt(input.subtotal) },
            shipping: { currency_code: "AUD", value: fmt(input.shipping) },
          },
        },
        items: input.lineItems.map((li) => ({
          name: li.name.slice(0, 127),
          sku: li.sku.slice(0, 127),
          quantity: String(li.qty),
          unit_amount: { currency_code: "AUD", value: fmt(li.unitPrice) },
          category: "PHYSICAL_GOODS",
        })),
      },
    ],
    application_context: {
      brand_name: "Yamaha Parts Australia",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
    },
  }

  const res = await fetch(`${cfg.baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    return {
      ok: false as const,
      reason: "paypal_create_failed" as const,
      message: `PayPal create-order failed (${res.status}): ${text.slice(0, 400)}`,
    }
  }

  const data = (await res.json()) as { id: string; status: string }
  return { ok: true as const, orderId: data.id, status: data.status }
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const cfg = getPayPalConfig()
  if (!cfg.ok) return cfg

  const token = await getAccessToken(cfg)

  const res = await fetch(
    `${cfg.baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  )

  if (!res.ok) {
    const text = await res.text()
    return {
      ok: false as const,
      reason: "paypal_capture_failed" as const,
      message: `PayPal capture failed (${res.status}): ${text.slice(0, 400)}`,
    }
  }

  const data = (await res.json()) as {
    id: string
    status: string
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id: string; status: string; amount?: { value: string; currency_code: string } }> }
    }>
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]
  return {
    ok: true as const,
    orderId: data.id,
    status: data.status,
    captureId: capture?.id,
    captureStatus: capture?.status,
    capturedAmount: capture?.amount?.value,
    raw: data,
  }
}
