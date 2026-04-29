import { getPayload } from "payload"
import config from "@payload-config"

export type FeedEntry = {
  stockNumber: string
  listingType: "used" | "demo"
  listingStatus: "available" | "on-hold"
  year: number
  make: string
  model: string
  variant?: string
  bodyType?: string
  engineCc?: number
  cylinders?: number
  transmission?: string
  kms: number
  colour?: string
  vin?: string
  engineNumber?: string
  registrationStatus?: "registered" | "unregistered"
  registrationState?: string
  registrationExpiryDate?: string
  complianceDate?: string
  buildDate?: string
  price: number
  priceLabel?: string
  description: string
  tagline?: string
  features: string[]
  photos: Array<{ url: string; caption?: string; order: number }>
  listingUrl: string
  bikesalesExternalId?: string
}

export type FeedMeta = {
  generatedAt: string
  dealer: string
  dealerPhone: string
  dealerEmail: string
  dealerAddress: string
  siteUrl: string
}

export type FeedPayload = {
  meta: FeedMeta
  entries: FeedEntry[]
}

const DEALER_META: Omit<FeedMeta, "generatedAt" | "siteUrl"> = {
  dealer: "Two Wheel Obsession",
  dealerPhone: "+61243319007",
  dealerEmail: "enquiries@twowheelobsession.com.au",
  dealerAddress: "169 Manns Road, West Gosford, NSW 2250",
}

export async function buildBikesalesFeed(): Promise<FeedPayload> {
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "")
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: "used-bikes",
    where: {
      and: [
        { listingStatus: { in: ["available", "on-hold"] } },
        { "syndication.bikesales.enabled": { equals: true } },
      ],
    },
    limit: 500,
    depth: 2,
  })

  const entries: FeedEntry[] = []
  for (const bike of result.docs as unknown as Array<Record<string, unknown>>) {
    const brand = bike.brand as { name?: string; slug?: string } | null
    const photos = (bike.photos as Array<{ image?: { url?: string }; caption?: string }> | undefined) ?? []

    const entry: FeedEntry = {
      stockNumber: String(bike.stockNumber ?? ""),
      listingType: (bike.condition as "used" | "demo") ?? "used",
      listingStatus: (bike.listingStatus as "available" | "on-hold") ?? "available",
      year: Number(bike.year ?? 0),
      make: brand?.name ?? "",
      model: String(bike.model ?? ""),
      variant: typeof bike.variant === "string" ? bike.variant : undefined,
      bodyType: typeof bike.bodyType === "string" ? bike.bodyType : undefined,
      engineCc: typeof bike.engineCc === "number" ? bike.engineCc : undefined,
      cylinders: typeof bike.cylinders === "number" ? bike.cylinders : undefined,
      transmission: typeof bike.transmission === "string" ? bike.transmission : undefined,
      kms: Number(bike.kms ?? 0),
      colour: typeof bike.color === "string" ? bike.color : undefined,
      vin: typeof bike.vin === "string" ? bike.vin : undefined,
      engineNumber: typeof bike.engineNumber === "string" ? bike.engineNumber : undefined,
      registrationStatus: typeof bike.registrationStatus === "string" ? (bike.registrationStatus as "registered" | "unregistered") : undefined,
      registrationState: typeof bike.registrationState === "string" ? bike.registrationState : undefined,
      registrationExpiryDate: dateOnly(bike.registrationExpiryDate),
      complianceDate: dateOnly(bike.complianceDate),
      buildDate: dateOnly(bike.buildDate),
      price: Number(bike.price ?? 0),
      priceLabel: typeof bike.priceLabel === "string" ? bike.priceLabel : undefined,
      tagline: typeof bike.tagline === "string" ? bike.tagline : undefined,
      description: extractDescriptionText(bike.description),
      features: extractFeatures(bike.features),
      photos: photos
        .map((p, i) => ({
          url: absoluteUrl(p.image?.url, siteUrl),
          caption: p.caption,
          order: i + 1,
        }))
        .filter((p) => !!p.url) as FeedEntry["photos"],
      listingUrl: `${siteUrl}/used-bikes/${bike.slug ?? ""}`,
      bikesalesExternalId: ((bike.syndication as { bikesales?: { externalId?: string } } | undefined)?.bikesales?.externalId) || undefined,
    }
    entries.push(entry)
  }

  return {
    meta: {
      ...DEALER_META,
      generatedAt: new Date().toISOString(),
      siteUrl,
    },
    entries,
  }
}

function absoluteUrl(url: string | undefined, base: string): string | undefined {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith("/")) return `${base}${url}`
  return `${base}/${url}`
}

function dateOnly(value: unknown): string | undefined {
  if (!value) return undefined
  const s = String(value)
  // Strip time portion, keep YYYY-MM-DD
  return s.split("T")[0]
}

function extractFeatures(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (v && typeof v === "object" && "feature" in v ? String((v as { feature?: string }).feature ?? "") : ""))
    .filter(Boolean)
}

// Walk a Lexical rich-text JSON tree and concatenate plain text content.
function extractDescriptionText(value: unknown): string {
  if (!value || typeof value !== "object") return ""
  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root) return ""
  return walkLexicalNodes(root.children ?? []).trim()
}

function walkLexicalNodes(nodes: unknown[]): string {
  let out = ""
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue
    const n = node as { type?: string; text?: string; children?: unknown[] }
    if (n.type === "text" && typeof n.text === "string") {
      out += n.text
    }
    if (Array.isArray(n.children)) {
      out += walkLexicalNodes(n.children)
    }
    if (n.type === "paragraph" || n.type === "heading" || n.type === "linebreak") {
      out += "\n"
    }
  }
  return out
}
