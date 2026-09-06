import type { Where } from "payload"

/**
 * Search query builder.
 *
 * There are roughly 100 bikes in the catalogue in total, so a search
 * service (Algolia/Typesense/pg full-text) would be a lot of moving
 * parts for a table Postgres can scan in single-digit milliseconds.
 * Payload `contains` clauses over the handful of fields a shopper
 * actually types into is the right size for this problem.
 */

const STOP_WORDS = new Set([
  "a", "an", "and", "for", "in", "of", "on", "or", "the", "to", "with", "bike",
  "bikes", "motorcycle", "motorcycles", "motorbike",
])

/**
 * Model names are written half a dozen ways — MT-07, MT07, "MT 07".
 * Expand each token into the variants a `contains` match would
 * otherwise miss.
 */
export function tokenVariants(token: string): string[] {
  const variants = new Set<string>([token])
  if (token.includes("-")) {
    variants.add(token.replace(/-/g, ""))
    variants.add(token.replace(/-/g, " "))
  }
  // "mt07" -> "mt-07" / "mt 07": split at the letter/digit boundary.
  const boundary = token.match(/^([a-z]+)(\d+)$/i)
  if (boundary) {
    variants.add(`${boundary[1]}-${boundary[2]}`)
    variants.add(`${boundary[1]} ${boundary[2]}`)
  }
  return [...variants]
}

export function tokenize(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .slice(0, 6) // guard against someone pasting an essay into the box
}

type LookupEntry = { id: number; name: string }

/**
 * Build the `where` for one collection. Every token must match
 * something (AND), but a token can match any field (OR) — so
 * "yamaha mt-07 2024" narrows instead of widening.
 */
export function buildBikeWhere({
  tokens,
  fields,
  brands,
  categories,
  base,
}: {
  tokens: string[]
  fields: string[]
  brands: LookupEntry[]
  categories: LookupEntry[]
  base: Where
}): Where {
  const perToken: Where[] = tokens.map((token) => {
    const or: Where[] = []

    for (const variant of tokenVariants(token)) {
      for (const field of fields) {
        or.push({ [field]: { contains: variant } } as Where)
      }
    }

    // A bare year should match the year column, not just any text
    // that happens to contain those four digits.
    if (/^\d{4}$/.test(token)) {
      or.push({ year: { equals: Number(token) } } as Where)
    }

    // Brand and category live on relationships, so text `contains`
    // can't reach them — resolve the name to an id first.
    const brandIds = brands.filter((b) => b.name.toLowerCase().includes(token)).map((b) => b.id)
    if (brandIds.length > 0) or.push({ brand: { in: brandIds } } as Where)

    const categoryIds = categories
      .filter((c) => c.name.toLowerCase().includes(token))
      .map((c) => c.id)
    if (categoryIds.length > 0) or.push({ category: { in: categoryIds } } as Where)

    return { or }
  })

  return { and: [base, ...perToken] }
}

/**
 * Someone typing "service" or "finance" is not looking for a bike.
 * Without this a perfectly reasonable search returns zero results and
 * reads as a broken site.
 */
export type Shortcut = { label: string; description: string; href: string }

const SHORTCUTS: Array<{ match: RegExp; shortcut: Shortcut }> = [
  {
    match: /\b(servic|repair|mechanic|logbook|log book|tyre|tune)/i,
    shortcut: {
      label: "Service & Repairs",
      description: "Book your bike in with our West Gosford workshop.",
      href: "/service-and-repairs",
    },
  },
  {
    match: /\b(part|oem|spare|accessor|genuine)/i,
    shortcut: {
      label: "Yamaha OEM Parts Finder",
      description: "Look up any genuine Yamaha part by model and year.",
      href: "/oem-parts-finder",
    },
  },
  {
    match: /\b(financ|loan|repayment|lease|afterpay|zip)/i,
    shortcut: {
      label: "Motorcycle finance",
      description: "Talk to us about finance on any new or used bike.",
      href: "/contact-us?type=finance",
    },
  },
  {
    match: /\b(contact|phone|call|address|hours|open|location|where)/i,
    shortcut: {
      label: "Contact us",
      description: "Phone, email, address and opening hours.",
      href: "/contact-us",
    },
  },
  {
    match: /\b(used|second|runout|run out|demo)/i,
    shortcut: {
      label: "Runouts & used bikes",
      description: "Every used and runout bike currently in stock.",
      href: "/used-bikes",
    },
  },
  {
    match: /\b(news|blog|workshop|article)/i,
    shortcut: {
      label: "Workshop news",
      description: "What's been through the workshop lately.",
      href: "/news",
    },
  },
]

export function matchShortcuts(raw: string): Shortcut[] {
  return SHORTCUTS.filter((s) => s.match.test(raw)).map((s) => s.shortcut)
}
