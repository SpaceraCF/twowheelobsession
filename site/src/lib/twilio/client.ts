// Twilio REST API helper for the custom shared-inbox.
// Server-only. Mirrors the placeholder-safe pattern from lib/paypal/client.ts
// so we can build + test the SMS flow without real Twilio credentials.
//
// Two responsibilities:
//   1. Send outbound SMS via Twilio's Messages resource.
//   2. Validate inbound webhooks using Twilio's signature header so
//      attackers can't POST fake SMS records into our inbox.

import twilio from "twilio"

const PLACEHOLDER_PREFIX = "PLACEHOLDER_"

export type TwilioConfig =
  | {
      ok: true
      accountSid: string
      authToken: string
      fromNumber: string
      client: ReturnType<typeof twilio>
    }
  | {
      ok: false
      reason: "missing_credentials"
      message: string
    }

export function getTwilioConfig(): TwilioConfig {
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? ""
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? ""
  const fromNumber = process.env.TWILIO_PHONE_NUMBER ?? ""

  if (
    !accountSid ||
    !authToken ||
    !fromNumber ||
    accountSid.startsWith(PLACEHOLDER_PREFIX) ||
    authToken.startsWith(PLACEHOLDER_PREFIX)
  ) {
    return {
      ok: false,
      reason: "missing_credentials",
      message:
        "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in the environment.",
    }
  }

  return {
    ok: true,
    accountSid,
    authToken,
    fromNumber,
    client: twilio(accountSid, authToken),
  }
}

/**
 * Send an SMS via Twilio. Returns the Twilio Message SID on success.
 * Returns a typed error if credentials aren't configured — callers
 * can route to a friendly message rather than crashing.
 */
export async function sendSms(opts: { to: string; body: string }) {
  const cfg = getTwilioConfig()
  if (!cfg.ok) return cfg

  try {
    const message = await cfg.client.messages.create({
      from: cfg.fromNumber,
      to: opts.to,
      body: opts.body,
    })
    return {
      ok: true as const,
      sid: message.sid,
      status: message.status,
    }
  } catch (err) {
    return {
      ok: false as const,
      reason: "twilio_send_failed" as const,
      message: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Validate a Twilio webhook request signature. Twilio computes an
 * HMAC-SHA1 of (URL + sorted form params) using the AUTH_TOKEN as the
 * key and sends it as the `X-Twilio-Signature` header. Without this
 * check anyone can POST fake SMS records to our inbox.
 *
 * `fullUrl` must be the exact public URL Twilio used (including
 * https://). Behind a proxy (Cloudflare → Render), trust the `x-
 * forwarded-host` / `x-forwarded-proto` headers — Render preserves
 * them by default.
 */
export function validateTwilioSignature(opts: {
  signature: string | null
  fullUrl: string
  formParams: Record<string, string>
}): boolean {
  const cfg = getTwilioConfig()
  if (!cfg.ok) return false
  if (!opts.signature) return false

  return twilio.validateRequest(
    cfg.authToken,
    opts.signature,
    opts.fullUrl,
    opts.formParams,
  )
}

/**
 * Normalise an Australian phone number to E.164 format (e.g.
 * 0400000000 → +61400000000). Returns null if the input isn't
 * obviously a phone number. Twilio requires E.164 on outbound
 * messages, but inbound webhooks already arrive in E.164 form so
 * this is mostly for customer-facing display normalisation.
 */
export function normaliseAuPhone(raw: string): string | null {
  const trimmed = raw.replace(/[^\d+]/g, "")
  if (trimmed.startsWith("+61") && trimmed.length === 12) return trimmed
  if (trimmed.startsWith("61") && trimmed.length === 11) return `+${trimmed}`
  if (trimmed.startsWith("04") && trimmed.length === 10) {
    return `+61${trimmed.slice(1)}`
  }
  if (trimmed.startsWith("4") && trimmed.length === 9) {
    return `+61${trimmed}`
  }
  return null
}
