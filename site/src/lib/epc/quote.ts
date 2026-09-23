import { getYamahaAccessKey } from './access-key'

const EPC_ORIGIN = 'https://ypicweb.epconline.com.au'
const GST_MULTIPLIER = 1.1
const MAX_RESPONSE_BYTES = 1_000_000

type EpcPart = {
  PartNo?: unknown
  Description?: unknown
  Price?: unknown
  SsPartNo?: unknown
  SsPrice?: unknown
  Discontinued?: unknown
}

export type TrustedPartQuote = {
  sku: string
  name: string
  unitPrice: number
}

export type PartQuoteResult =
  | { ok: true; quote: TrustedPartQuote }
  | { ok: false; reason: 'not_found' | 'unavailable' }

function normaliseSku(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

function parseJsonp(text: string): unknown {
  const trimmed = text.trim()
  const match = trimmed.match(/^quote\(([\s\S]*)\);?$/)
  return JSON.parse(match ? match[1] : trimmed)
}

/** Resolve the current dealer price from EPC; client cart prices are advisory only. */
export async function quoteYamahaPart(rawSku: string): Promise<PartQuoteResult> {
  const sku = normaliseSku(rawSku)
  if (!/^[A-Z0-9][A-Z0-9._/-]{1,126}$/.test(sku)) {
    return { ok: false, reason: 'not_found' }
  }

  const access = await getYamahaAccessKey()
  if (!access.ok) return { ok: false, reason: 'unavailable' }

  try {
    const url = new URL(
      `/Part/getAjaxPartSearch/${encodeURIComponent(sku)}/${encodeURIComponent(access.key)}`,
      EPC_ORIGIN,
    )
    url.searchParams.set('callback', 'quote')
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) return { ok: false, reason: 'unavailable' }

    const text = await response.text()
    if (text.length > MAX_RESPONSE_BYTES) return { ok: false, reason: 'unavailable' }
    const parsed = parseJsonp(text)
    if (!Array.isArray(parsed)) return { ok: false, reason: 'unavailable' }

    const part = (parsed as EpcPart[]).find((candidate) => {
      const effectiveSku = normaliseSku(candidate.SsPartNo) || normaliseSku(candidate.PartNo)
      const discontinued = candidate.Discontinued === true || candidate.Discontinued === 1 || candidate.Discontinued === 'true'
      return effectiveSku === sku && !discontinued
    })
    if (!part) return { ok: false, reason: 'not_found' }

    const superseded = normaliseSku(part.SsPartNo) !== ''
    const effectiveSku = normaliseSku(superseded ? part.SsPartNo : part.PartNo)
    const basePrice = Number(superseded ? part.SsPrice : part.Price)
    const name = typeof part.Description === 'string' ? part.Description.trim() : ''
    if (!effectiveSku || !name || !Number.isFinite(basePrice) || basePrice <= 0) {
      return { ok: false, reason: 'not_found' }
    }

    return {
      ok: true,
      quote: {
        sku: effectiveSku,
        name: name.slice(0, 200),
        unitPrice: Math.round(basePrice * GST_MULTIPLIER * 100) / 100,
      },
    }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}
