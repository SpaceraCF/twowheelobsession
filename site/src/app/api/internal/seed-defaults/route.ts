import { NextResponse } from 'next/server'

import { seedDefaults } from '@/lib/seed/defaults'

// Idempotent bootstrap seed for the assets that the team would
// otherwise have to upload manually on first install:
//   - Brand logos (Yamaha / Suzuki / CFMOTO) into Media + linked
//     to the matching Brand record
//   - 4 homepage Hero slides into Media + HeroSlides
//
// Auth: same shared SYNC_SECRET pattern as the other internal seeds.
//
// Run on prod once after first deploy:
//   curl -X POST https://twowo-site.onrender.com/api/internal/seed-defaults \
//     -H "x-sync-secret: $SYNC_SECRET"

function isAuthorized(req: Request) {
  const expected = process.env.SYNC_SECRET
  if (!expected) return false
  const got = req.headers.get('x-sync-secret') || ''
  return got === expected
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const result = await seedDefaults()
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
