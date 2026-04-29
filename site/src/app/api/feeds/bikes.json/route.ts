import { NextResponse } from "next/server"

import { buildBikesalesFeed } from "@/lib/feeds/build"

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
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const payload = await buildBikesalesFeed()
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "X-Feed-Count": String(payload.entries.length),
        "X-Feed-Generated": payload.meta.generatedAt,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "feed build failed" },
      { status: 500 },
    )
  }
}
