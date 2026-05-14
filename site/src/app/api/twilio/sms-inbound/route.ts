import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { fanOutInboundSms } from '@/lib/notifications/sms-inbox'
import { validateTwilioSignature } from '@/lib/twilio/client'

// Twilio inbound SMS webhook. Twilio POSTs every incoming SMS to this
// endpoint as application/x-www-form-urlencoded with fields:
//   From, To, Body, MessageSid, NumMedia, FromCity, FromState, ...
//
// We:
//   1. Validate the X-Twilio-Signature so attackers can't post fake SMS
//   2. Find or create a Conversation by phone number
//   3. Create a Message doc (direction: inbound)
//   4. Update Conversation's lastMessageAt + preview + unreadCount
//   5. Email all staff (Web Push lands in checkpoint 2)
//   6. Return an empty <Response/> (TwiML) so Twilio doesn't auto-reply
//
// Configure in Twilio console:
//   Phone number → Messaging configuration → "A message comes in"
//     → Webhook → {SITE_URL}/api/twilio/sms-inbound (HTTP POST)

export async function POST(req: Request) {
  // Twilio sends form-encoded; convert to plain object for both
  // signature validation AND downstream use. Cloning lets us read it
  // twice (once for signature validation, once for the actual data).
  const formText = await req.text()
  const form = new URLSearchParams(formText)
  const formParams: Record<string, string> = {}
  form.forEach((value, key) => {
    formParams[key] = value
  })

  // Verify signature. The URL Twilio signed is the public URL it
  // POSTed to — behind Cloudflare → Render, trust forwarded headers.
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? ''
  const path = new URL(req.url).pathname
  const fullUrl = `${proto}://${host}${path}`
  const signature = req.headers.get('x-twilio-signature')

  const sigValid = validateTwilioSignature({ signature, fullUrl, formParams })
  if (!sigValid) {
    // 403 — not 401, because the request HAS auth (the signature) but
    // it's invalid. Don't leak detail in the body.
    return new NextResponse('forbidden', { status: 403 })
  }

  const from = formParams.From?.trim()
  const body = formParams.Body?.trim() ?? ''
  const messageSid = formParams.MessageSid?.trim()

  if (!from || !messageSid) {
    return new NextResponse('missing required fields', { status: 400 })
  }

  let payload
  try {
    payload = await getPayload({ config })
  } catch (err) {
    console.error('[twilio inbound] failed to get payload instance', err)
    return new NextResponse('server error', { status: 500 })
  }

  // Find or create the conversation. `findOrCreate`-style pattern:
  // upsert by phoneNumber.
  let conversationId: string | number
  try {
    const existing = await payload.find({
      collection: 'conversations',
      where: { phoneNumber: { equals: from } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      const conv = existing.docs[0]
      conversationId = conv.id
      await payload.update({
        collection: 'conversations',
        id: conversationId,
        data: {
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: body.slice(0, 120),
          unreadCount: (Number((conv as { unreadCount?: number }).unreadCount) || 0) + 1,
          // Re-open on new inbound — closed conversations bubble back
          // up when the customer texts again.
          status: 'open',
        } as never,
      })
    } else {
      const created = await payload.create({
        collection: 'conversations',
        data: {
          phoneNumber: from,
          status: 'open',
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: body.slice(0, 120),
          unreadCount: 1,
        } as never,
      })
      conversationId = created.id
    }
  } catch (err) {
    payload.logger.error({ err }, '[twilio inbound] conversation upsert failed')
    return new NextResponse('server error', { status: 500 })
  }

  // Persist the message doc.
  try {
    await payload.create({
      collection: 'messages',
      data: {
        conversation: conversationId,
        direction: 'inbound',
        body,
        twilioMessageSid: messageSid,
        status: 'received',
      } as never,
    })
  } catch (err) {
    payload.logger.error({ err }, '[twilio inbound] message create failed')
    // Still respond 200 so Twilio doesn't retry — we'd rather log and
    // investigate than reprocess.
  }

  // Fan out: Web Push to subscribed PWAs + email to all staff +
  // optional SMS to staff who opted in. All best-effort.
  fanOutInboundSms({
    payload,
    conversationId,
    phoneNumber: from,
    body,
  }).catch((err) => {
    payload.logger.error({ err }, '[twilio inbound] fan-out errored')
  })

  // Empty TwiML response — tells Twilio "we got it, don't auto-reply".
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    status: 200,
    headers: { 'content-type': 'text/xml; charset=utf-8' },
  })
}
