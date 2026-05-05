import type { MetadataRoute } from "next"
import { getPayload } from "payload"
import config from "@payload-config"

// Sitemap queries Payload (bike collections) at request time. We don't
// want it bundled into the build (DB may not be ready / dev push-mode
// triggers an interactive migration prompt at boot).
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "")

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
