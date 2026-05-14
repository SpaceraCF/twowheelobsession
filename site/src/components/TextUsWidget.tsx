"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

// Floating "Text us" widget — replaces the legacy Podium widget. The
// customer taps "Text us" on their phone, the OS opens their SMS app
// pre-addressed to TWO's SMS-business number. Staff respond via the
// chosen SMS-platform's mobile app (OpenPhone / Heymarket / similar),
// where they can claim threads, share an inbox, and reply by tapping.
//
// Two env vars drive this:
//   NEXT_PUBLIC_SMS_BUSINESS_NUMBER — international format,
//     e.g. +61400000000. SMS-capable, NOT the landline.
//   NEXT_PUBLIC_SMS_DISPLAY         — pretty-formatted version shown
//     in the popover, e.g. "0400 000 000". Optional; falls back to
//     the international number.
//
// If NEXT_PUBLIC_SMS_BUSINESS_NUMBER is not set, the widget renders
// nothing — keeps the site clean until Nikkie has the SMS account
// stood up and a real number to advertise.

type TextUsWidgetProps = {
  /** Phone number for tel: link. Defaults to TWO's landline. */
  phoneTel?: string
  /** Pretty version of the phone number to display. */
  phoneDisplay?: string
}

export function TextUsWidget({
  phoneTel = "+61243319007",
  phoneDisplay = "(02) 4331 9007",
}: TextUsWidgetProps) {
  const smsNumber = process.env.NEXT_PUBLIC_SMS_BUSINESS_NUMBER
  const smsDisplay = process.env.NEXT_PUBLIC_SMS_DISPLAY || smsNumber

  const [open, setOpen] = useState(false)

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Bail if the SMS number isn't configured — site stays clean.
  if (!smsNumber) return null

  const smsHref = `sms:${smsNumber}?body=${encodeURIComponent(
    "Hi Two Wheel Obsession, I have a question about ",
  )}`

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Contact options"
          className="absolute bottom-14 right-0 w-[280px] bg-white border border-zinc-200 rounded-lg shadow-2xl overflow-hidden"
        >
          <div className="bg-red-600 text-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
              Get a quick response
            </p>
            <p className="mt-0.5 text-base font-extrabold">Text us</p>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <p className="text-zinc-700 leading-relaxed">
              Send us a text and we'll reply when one of the team's free —
              usually within the hour during opening times.
            </p>
            <a
              href={smsHref}
              className="flex items-center justify-between gap-3 px-3 py-3 bg-zinc-900 text-white rounded font-semibold hover:bg-black"
              onClick={() => setOpen(false)}
            >
              <span>Text {smsDisplay}</span>
              <ChevronRight />
            </a>
            <a
              href={`tel:${phoneTel}`}
              className="flex items-center justify-between gap-3 px-3 py-3 border border-zinc-200 rounded text-zinc-900 font-semibold hover:border-zinc-900"
              onClick={() => setOpen(false)}
            >
              <span>Call {phoneDisplay}</span>
              <ChevronRight />
            </a>
            <Link
              href="/contact-us"
              className="block text-center text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline-offset-2 hover:underline pt-1"
              onClick={() => setOpen(false)}
            >
              Or send a written enquiry
            </Link>
            <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
              Mon–Fri 8:30am–5:30pm · Sat 9am–1pm · Sun closed
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Text us"}
        className="inline-flex items-center gap-2 h-12 px-4 rounded-full bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 transition-colors"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
        <span className="text-sm">{open ? "Close" : "Text us"}</span>
      </button>
    </div>
  )
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
