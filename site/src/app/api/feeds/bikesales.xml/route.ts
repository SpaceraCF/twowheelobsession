import { buildBikesalesFeed } from "@/lib/feeds/build"
import { buildBikesalesXml } from "@/lib/feeds/bikesales-xml"

export const dynamic = "force-dynamic"
export const revalidate = 0

function isAuthorized(req: Request): boolean {
  const expected = process.env.FEED_SECRET
  if (!expected) return false

  const url = new URL(req.url)
  const tokenFromQuery = url.searchParams.get("token")
  if (tokenFromQuery && tokenFromQuery === expected) return true

  const auth = req.headers.get("authorization") ?? ""
  if (auth.startsWith("Bearer ") && auth.slice(7) === expected) return true

  return false
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new Response("unauthorized", { status: 401 })
  }
  try {
    const payload = await buildBikesalesFeed()
    const xml = buildBikesalesXml(payload)
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
        "X-Feed-Count": String(payload.entries.length),
        "X-Feed-Generated": payload.meta.generatedAt,
      },
    })
  } catch (err) {
    return new Response(
      `<error>${err instanceof Error ? err.message : "feed build failed"}</error>`,
      { status: 500, headers: { "Content-Type": "application/xml" } },
    )
  }
}
