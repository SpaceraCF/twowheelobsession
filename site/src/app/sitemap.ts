import type { MetadataRoute } from "next"
import { headers } from "next/headers"
import { getPayload } from "payload"
import config from "@payload-config"

// Host-aware sitemap. The same Next.js app serves both
// twowheelobsession.com.au and yamahapartsaustralia.com.au — each
// domain emits its own URL set so search engines see two clean sites,
// not one with cross-domain duplicate content.
export const dynamic = "force-dynamic"

const PARTS_HOSTS = new Set([
  "yamahapartsaustralia.com.au",
  "www.yamahapartsaustralia.com.au",
])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hdrs = await headers()
  const host = (hdrs.get("host") ?? "").toLowerCase()
  const isPartsHost = PARTS_HOSTS.has(host)
  const protocol = host.includes("localhost") ? "http" : "https"
  const detectedHost = host || (process.env.SITE_URL ?? "localhost:3000").replace(/^https?:\/\//, "")
  const siteUrl = `${protocol}://${detectedHost}`.replace(/\/$/, "")

  if (isPartsHost) {
    const now = new Date()
    return [
      { url: `${siteUrl}/`,                 changeFrequency: "weekly",  priority: 1.0, lastModified: now },
      { url: `${siteUrl}/privacy-policy`,   changeFrequency: "yearly",  priority: 0.3, lastModified: now },
      { url: `${siteUrl}/terms`,            changeFrequency: "yearly",  priority: 0.3, lastModified: now },
    ]
  }

  // Static routes
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`,                   changeFrequency: "daily",   priority: 1.0,  lastModified: now },
    { url: `${siteUrl}/new-bikes`,          changeFrequency: "daily",   priority: 0.9,  lastModified: now },
    { url: `${siteUrl}/used-bikes`,         changeFrequency: "daily",   priority: 0.9,  lastModified: now },
    { url: `${siteUrl}/oem-parts-finder`,   changeFrequency: "weekly",  priority: 0.7,  lastModified: now },
    { url: `${siteUrl}/service-and-repairs`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${siteUrl}/contact-us`,         changeFrequency: "yearly",  priority: 0.5,  lastModified: now },
  ]

  // Bike detail routes — pull from Payload. Fail silently if DB isn't reachable
  // at request time (sitemap is fetched ahead of build sometimes).
  let bikeEntries: MetadataRoute.Sitemap = []
  try {
    const payload = await getPayload({ config })
    const [newBikes, usedBikes] = await Promise.all([
      payload.find({
        collection: "new-bikes",
        where: { status: { equals: "available" } },
        limit: 500,
        depth: 0,
      }),
      payload.find({
        collection: "used-bikes",
        where: { listingStatus: { in: ["available", "on-hold"] } },
        limit: 500,
        depth: 0,
      }),
    ])

    bikeEntries = [
      ...newBikes.docs.map((b) => ({
        url: `${siteUrl}/new-bikes/${b.slug}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...usedBikes.docs.map((b) => ({
        url: `${siteUrl}/used-bikes/${b.slug}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ]
  } catch (err) {
    console.warn("[sitemap] Could not load bikes:", err instanceof Error ? err.message : err)
  }

  return [...staticEntries, ...bikeEntries]
}
