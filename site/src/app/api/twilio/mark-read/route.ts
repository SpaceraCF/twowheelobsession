import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@payload-config'

// Resets a conversation's `unreadCount` to 0. Called by the
// conversation thread UI when a staff member opens / views the
// conversation — clearing the unread badge on the inbox list.

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const hdrs = await headers()
  const { user } = await payload.auth({ headers: hdrs })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let json: { conversationId?: string | number }
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!json.conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
  }

  try {
    await payload.update({
      collection: 'conversations',
      id: json.conversationId,
      data: { unreadCount: 0 } as never,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    payload.logger.error({ err }, '[mark-read] update failed')
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }
}
