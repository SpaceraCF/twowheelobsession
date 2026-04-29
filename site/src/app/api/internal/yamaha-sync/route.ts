import { NextResponse } from 'next/server'

import { syncYamahaBikes } from '@/lib/yamaha/sync'

function isAuthorized(req: Request) {
  const expected = process.env.SYNC_SECRET
  if (!expected) return false
  const got = req.headers.get('x-sync-secret') || ''
  return got === expected
}

export const maxDuration = 300

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const result = await syncYamahaBikes()
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
