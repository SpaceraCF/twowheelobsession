import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@payload-config'

// Store a browser Web Push subscription on the current user's
// `pushSubscriptions` array. Called by PushSetup when a staff member
// installs the PWA and grants notification permission.
//
// Idempotent on the `endpoint` URL — re-subscribing the same browser
// updates `lastSeenAt` instead of duplicating.

type PushSubscriptionJSON = {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
}

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const hdrs = await headers()
  const { user } = await payload.auth({ headers: hdrs })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let json: PushSubscriptionJSON
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const endpoint = json.endpoint?.trim()
  const p256dh = json.keys?.p256dh?.trim()
  const auth = json.keys?.auth?.trim()
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: 'subscription must include endpoint + keys.p256dh + keys.auth' },
      { status: 400 },
    )
  }

  const userAgent = req.headers.get('user-agent')?.slice(0, 200) ?? ''
  const now = new Date().toISOString()

  // Read the full user doc, dedupe by endpoint, write back.
  type SubRow = {
    endpoint: string
    p256dh: string
    auth: string
    userAgent?: string
    createdAt?: string
  }
  const userDoc = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
  })
  const existing = ((userDoc as { pushSubscriptions?: SubRow[] }).pushSubscriptions ?? []).filter(
    (s) => s && s.endpoint && s.endpoint !== endpoint,
  )
  const next: SubRow[] = [
    ...existing,
    { endpoint, p256dh, auth, userAgent, createdAt: now },
  ]

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { pushSubscriptions: next } as never,
    })
  } catch (err) {
    payload.logger.error({ err }, '[push/subscribe] user update failed')
    return NextResponse.json({ error: 'subscribe failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, total: next.length })
}
