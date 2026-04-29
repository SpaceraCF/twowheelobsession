// Server-side helper to fetch the EPC Online access key for the Yamaha
// parts catalog. The key is a paid-subscription session token tied to the
// dealer ID. We cache it briefly so we don't hammer the adminapi on every
// page load.

const ADMIN_API = "https://adminapi.epconline.com.au/Subscription/AccessKey"
const CACHE_TTL_MS = 25 * 60 * 1000 // 25 minutes

let cached: { key: string; expiresAt: number } | null = null

export type EpcAccessKeyResult =
  | { ok: true; key: string }
  | { ok: false; error: string }

export async function getYamahaAccessKey(): Promise<EpcAccessKeyResult> {
  const dealerId = process.env.EPC_DEALER_ID
  const productKey = process.env.EPC_PRODUCT_KEY_YAMAHA
  if (!dealerId || !productKey) {
    return {
      ok: false,
      error: "EPC_DEALER_ID and EPC_PRODUCT_KEY_YAMAHA must be set",
    }
  }

  if (cached && cached.expiresAt > Date.now()) {
    return { ok: true, key: cached.key }
  }

  try {
    const url = `${ADMIN_API}/${encodeURIComponent(dealerId)}/${encodeURIComponent(productKey)}/`
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      return { ok: false, error: `adminapi ${res.status}` }
    }
    const text = (await res.text()).trim()
    // The API returns the key wrapped in literal double-quotes — e.g. `"abc-123"`.
    const key = text.replace(/^"|"$/g, "")
    if (!key) {
      return { ok: false, error: "adminapi returned empty body" }
    }
    cached = { key, expiresAt: Date.now() + CACHE_TTL_MS }
    return { ok: true, key }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
