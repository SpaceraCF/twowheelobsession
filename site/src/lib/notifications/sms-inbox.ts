// Fan-out helpers for the SMS inbox. Called from the Twilio inbound
// webhook. Three notification channels:
//   1. Web Push to subscribed staff PWAs (primary)
//   2. Email to all staff (always-on fallback so we never lose a message)
//   3. SMS to each staff member who opted in (belt + braces — optional)

import type { Payload } from 'payload'

import { sendPush, type PushSubscriptionRecord } from '@/lib/push/server'
import { sendSms } from '@/lib/twilio/client'

const ADMIN_BASE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

type FanOutArgs = {
  payload: Payload
  conversationId: string | number
  phoneNumber: string
  body: string
}

type StaffRow = {
  id: string | number
  email?: string
  personalMobile?: string
  smsFanOutEnabled?: boolean
  pushSubscriptions?: PushSubscriptionRecord[]
}

/**
 * Loads every admin/staff user once and runs three notification
 * channels in parallel. Errors are logged but never thrown — losing
 * an email doesn't block the push, etc.
 */
export async function fanOutInboundSms({
  payload,
  conversationId,
  phoneNumber,
  body,
}: FanOutArgs): Promise<void> {
  let staff: StaffRow[] = []
  try {
    const result = await payload.find({
      collection: 'users',
      where: { role: { in: ['admin', 'staff'] } },
      limit: 100,
      depth: 0,
    })
    staff = result.docs as unknown as StaffRow[]
  } catch (err) {
    payload.logger.error({ err }, '[sms-inbox] could not load staff users')
    return
  }

  if (staff.length === 0) return

  const preview = body.replace(/\s+/g, ' ').slice(0, 300)
  const conversationLink = `${ADMIN_BASE}/admin/collections/conversations/${conversationId}`

  await Promise.allSettled([
    pushFanOut({ payload, staff, phoneNumber, preview, conversationId }),
    emailFanOut({ payload, staff, phoneNumber, preview, conversationLink }),
    smsFanOut({ payload, staff, phoneNumber, preview }),
  ])
}

async function pushFanOut(args: {
  payload: Payload
  staff: StaffRow[]
  phoneNumber: string
  preview: string
  conversationId: string | number
}) {
  const url = `/admin/collections/conversations/${args.conversationId}`
  const payload: import('@/lib/push/server').PushPayload = {
    title: `SMS from ${args.phoneNumber}`,
    body: args.preview,
    url,
    tag: `convo-${args.conversationId}`,
  }

  for (const user of args.staff) {
    const subs = Array.isArray(user.pushSubscriptions) ? user.pushSubscriptions : []
    if (subs.length === 0) continue

    // Track gone subscriptions so we can prune them from the user
    // after the loop.
    const goneEndpoints: string[] = []
    await Promise.all(
      subs.map(async (sub) => {
        const status = await sendPush(sub, payload)
        if (status === 'gone' && sub.endpoint) goneEndpoints.push(sub.endpoint)
      }),
    )

    if (goneEndpoints.length > 0) {
      const remaining = subs.filter((s) => !goneEndpoints.includes(s.endpoint))
      try {
        await args.payload.update({
          collection: 'users',
          id: user.id,
          data: { pushSubscriptions: remaining } as never,
        })
      } catch (err) {
        args.payload.logger.error({ err }, '[sms-inbox] failed to prune dead push subscriptions')
      }
    }
  }
}

async function emailFanOut(args: {
  payload: Payload
  staff: StaffRow[]
  phoneNumber: string
  preview: string
  conversationLink: string
}) {
  if (!args.payload.email) return
  const emails = args.staff
    .map((u) => u.email)
    .filter((e): e is string => typeof e === 'string' && e.includes('@'))
  if (emails.length === 0) return

  const subject = `[SMS Inbox] ${args.phoneNumber}: ${args.preview.slice(0, 60)}`
  const text = [
    'New SMS to the TWO inbox.',
    '',
    `From: ${args.phoneNumber}`,
    '',
    'Message:',
    args.preview,
    '',
    `Open and reply: ${args.conversationLink}`,
  ].join('\n')

  await Promise.all(
    emails.map(async (to) => {
      try {
        await args.payload.sendEmail({ to, subject, text })
      } catch (err) {
        args.payload.logger.error(
          { err, to },
          '[sms-inbox] notification email failed',
        )
      }
    }),
  )
}

async function smsFanOut(args: {
  payload: Payload
  staff: StaffRow[]
  phoneNumber: string
  preview: string
}) {
  const recipients = args.staff.filter(
    (u) =>
      u.smsFanOutEnabled &&
      typeof u.personalMobile === 'string' &&
      /^\+\d{8,15}$/.test(u.personalMobile),
  )
  if (recipients.length === 0) return

  // Keep the SMS short to stay in one segment (160 chars). Twilio
  // charges per segment so a one-segment notification is the
  // cheapest fan-out.
  const body = `TWO inbox: ${args.phoneNumber} — ${args.preview.slice(0, 100)}`

  await Promise.all(
    recipients.map(async (user) => {
      const result = await sendSms({ to: user.personalMobile as string, body })
      if (!result.ok) {
        args.payload.logger.error(
          { reason: result.reason, message: result.message, to: user.personalMobile },
          '[sms-inbox] SMS fan-out failed',
        )
      }
    }),
  )
}
