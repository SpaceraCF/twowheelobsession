import { NextResponse } from "next/server"

import { seedUsedBikes } from "@/lib/seed-used-bikes"

function isAuthorized(req: Request) {
  const expected = process.env.SYNC_SECRET
  if (!expected) return false
  return (req.headers.get("x-sync-secret") ?? "") === expected
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const result = await seedUsedBikes()
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
