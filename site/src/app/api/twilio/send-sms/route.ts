import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@payload-config'

import { sendSms } from '@/lib/twilio/client'

// Outbound SMS endpoint — staff replies. Authenticated via Payload's
// session cookie. Body: { conversationId, body }.
//
// Flow:
//   1. Verify the requester is a logged-in staff user
//   2. Load the conversation (so we have phoneNumber + can update it)
//   3. Send SMS via Twilio
//   4. Persist outbound Message doc (with sentBy + Twilio SID)
//   5. Update Conversation's lastMessageAt + preview + clear unread

export async function POST(req: Request) {
  const payload = await getPayload({ config })

  // Authenticate via Payload's auth middleware.
  const hdrs = await headers()
  const { user } = await payload.auth({ headers: hdrs })
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let json: { conversationId?: string | number; body?: string }
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const conversationId = json.conversationId
  const body = (json.body ?? '').trim()

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
  }
  if (!body) {
    return NextResponse.json({ error: 'body required' }, { status: 400 })
  }
  if (body.length > 1600) {
    // Twilio splits long messages into segments at 160 chars but caps
    // around 1600. Reject preposterously long replies — staff can
    // send a follow-up if needed.
    return NextResponse.json(
      { error: 'message too long (max 1600 chars)' },
      { status: 400 },
    )
  }

  // Load conversation to get the phone number.
  let conversation
  try {
    conversation = await payload.findByID({
      collection: 'conversations',
      id: conversationId,
      depth: 0,
    })
  } catch {
    return NextResponse.json({ error: 'conversation not found' }, { status: 404 })
  }
  const to = (conversation as { phoneNumber?: string }).phoneNumber
  if (!to) {
    return NextResponse.json({ error: 'conversation has no phone number' }, { status: 400 })
  }

  // Send via Twilio.
  const result = await sendSms({ to, body })
  if (!result.ok) {
    if (result.reason === 'missing_credentials') {
      return NextResponse.json(
        { error: 'SMS sending not configured yet — see Twilio env vars.' },
        { status: 503 },
      )
    }
    // Twilio failure — persist a failed message doc for visibility, then
    // surface the error to the staff member.
    try {
      await payload.create({
        collection: 'messages',
        data: {
          conversation: conversationId,
          direction: 'outbound',
          body,
          status: 'failed',
          errorMessage: result.message,
          sentBy: user.id,
        } as never,
      })
    } catch (err) {
      payload.logger.error({ err }, '[send-sms] failed message persist also failed')
    }
    return NextResponse.json(
      { error: `Twilio rejected the message: ${result.message}` },
      { status: 502 },
    )
  }

  // Persist outbound message doc.
  let created
  try {
    created = await payload.create({
      collection: 'messages',
      data: {
        conversation: conversationId,
        direction: 'outbound',
        body,
        twilioMessageSid: result.sid,
        status: result.status === 'queued' ? 'queued' : 'sent',
        sentBy: user.id,
      } as never,
    })
  } catch (err) {
    payload.logger.error({ err }, '[send-sms] message persist failed AFTER Twilio sent')
    // SMS already went out — surface success to caller anyway, but
    // log loudly so staff know to reconcile.
    return NextResponse.json({
      ok: true,
      sid: result.sid,
      warning: 'SMS sent but local record failed to save — check the conversation.',
    })
  }

  // Update conversation summary. Outbound also clears unreadCount (the
  // act of replying means the staff has seen it).
  try {
    await payload.update({
      collection: 'conversations',
      id: conversationId,
      data: {
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: body.slice(0, 120),
        unreadCount: 0,
      } as never,
    })
  } catch (err) {
    payload.logger.error({ err }, '[send-sms] conversation update failed (message sent OK)')
  }

  return NextResponse.json({ ok: true, sid: result.sid, messageId: created.id })
}
