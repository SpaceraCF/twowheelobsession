// Email bridge used until Web Push lands (checkpoint 2). When a new
// inbound SMS arrives, fire an email to all staff with role=staff or
// role=admin. The email body has the customer's phone number and
// message preview + a link straight into the conversation thread in
// the admin so they can tap-and-reply on mobile.

import { getPayload } from 'payload'
import type { Payload } from 'payload'

const ADMIN_BASE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

type NotifyArgs = {
  payload: Payload
  conversationId: string | number
  phoneNumber: string
  body: string
}

export async function notifyStaffOfInboundSms({
  payload,
  conversationId,
  phoneNumber,
  body,
}: NotifyArgs): Promise<void> {
  if (!payload.email) return

  let staffEmails: string[] = []
  try {
    const result = await payload.find({
      collection: 'users',
      where: { role: { in: ['admin', 'staff'] } },
      limit: 100,
      depth: 0,
    })
    staffEmails = result.docs
      .map((u) => (u as { email?: string }).email)
      .filter((e): e is string => typeof e === 'string' && e.includes('@'))
  } catch (err) {
    payload.logger.error({ err }, '[SMS inbox] could not load staff users for notification')
    return
  }

  if (staffEmails.length === 0) return

  const subject = `[SMS Inbox] ${phoneNumber}: ${body.slice(0, 60)}`
  const preview = body.replace(/\s+/g, ' ').slice(0, 300)
  const link = `${ADMIN_BASE}/admin/collections/conversations/${conversationId}`

  const text = [
    `New SMS to the TWO inbox.`,
    '',
    `From: ${phoneNumber}`,
    '',
    'Message:',
    preview,
    '',
    `Open and reply: ${link}`,
    '',
    "(Email is a temporary bridge — push notifications land in the next deploy.)",
  ].join('\n')

  // Send to every staff member in parallel. Don't block on individual
  // failures — one bad address shouldn't stop the others.
  await Promise.all(
    staffEmails.map(async (to) => {
      try {
        await payload.sendEmail({ to, subject, text })
      } catch (err) {
        payload.logger.error(
          { err, to },
          '[SMS inbox] failed to send inbound notification email',
        )
      }
    }),
  )
}

// Convenience for endpoints that already have a Payload instance handy.
export { getPayload }
