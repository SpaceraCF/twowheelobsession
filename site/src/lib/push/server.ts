// Web Push helper — wraps the `web-push` npm package with VAPID
// setup + placeholder-safe guards (mirrors lib/paypal/client.ts and
// lib/twilio/client.ts).
//
// VAPID keys are generated once with `npx web-push generate-vapid-keys`
// and stored as env vars (both public and private). NEXT_PUBLIC_
// mirror exists so the browser can subscribe with the public key.

import webpush from 'web-push'

const PLACEHOLDER_PREFIX = 'PLACEHOLDER_'

let configured: boolean | null = null

export function isPushConfigured(): boolean {
  if (configured !== null) return configured
  const pub = process.env.VAPID_PUBLIC_KEY ?? ''
  const priv = process.env.VAPID_PRIVATE_KEY ?? ''
  const subject = process.env.VAPID_SUBJECT ?? ''
  if (
    !pub ||
    !priv ||
    !subject ||
    pub.startsWith(PLACEHOLDER_PREFIX) ||
    priv.startsWith(PLACEHOLDER_PREFIX)
  ) {
    configured = false
    return false
  }
  try {
    webpush.setVapidDetails(subject, pub, priv)
    configured = true
    return true
  } catch (err) {
    console.error('[push] VAPID setup failed', err)
    configured = false
    return false
  }
}

export type PushSubscriptionRecord = {
  endpoint: string
  p256dh: string
  auth: string
}

export type PushPayload = {
  title: string
  body: string
  /** Where the browser opens when the user taps the notification. */
  url?: string
  /** Tag — collapses notifications with the same tag into one. */
  tag?: string
}

/**
 * Sends a push to a single subscription. Returns `'gone'` if the
 * subscription endpoint is 404/410 (browser unsubscribed) so the
 * caller can prune it from the user's record.
 */
export async function sendPush(
  sub: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<'sent' | 'gone' | 'error'> {
  if (!isPushConfigured()) return 'error'

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
    )
    return 'sent'
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'statusCode' in err
        ? (err as { statusCode?: number }).statusCode
        : undefined
    if (status === 404 || status === 410) return 'gone'
    console.error('[push] send failed', err)
    return 'error'
  }
}
