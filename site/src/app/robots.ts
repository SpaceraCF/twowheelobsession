import type { MetadataRoute } from "next"
import { headers } from "next/headers"

// Host-aware robots.txt — same Next.js app serves both
// twowheelobsession.com.au and yamahapartsaustralia.com.au, so each
// host needs to advertise its OWN sitemap (not the other domain's).
//
// Force-dynamic because we read the request `host` header.

export const dynamic = "force-dynamic"

const PARTS_HOSTS = new Set([
  "yamahapartsaustralia.com.au",
  "www.yamahapartsaustralia.com.au",
])

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hdrs = await headers()
  const host = (hdrs.get("host") ?? "").toLowerCase()
  const isPartsHost = PARTS_HOSTS.has(host)

  const protocol = host.includes("localhost") ? "http" : "https"
  const siteUrl = `${protocol}://${host || "www.twowheelobsession.com.au"}`

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: isPartsHost
          ? ["/admin", "/api/", "/oem-widget", "/parts/"]
          : ["/admin", "/api/", "/oem-widget"],
      },
      // Allow major AI crawlers explicitly. They generally respect the
      // generic `*` rules but spelling them out signals intent (and some
      // are stricter about explicit allowlisting in 2026).
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
        disallow: ["/admin", "/api/", "/oem-widget"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
