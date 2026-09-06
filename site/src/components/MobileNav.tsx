"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

type NavItem = { label: string; href: string }

/**
 * Mobile navigation. Until this existed the nav was `hidden lg:flex`
 * with no fallback, so anyone below 1024px — i.e. most visitors —
 * had no way to reach bikes, parts or contact at all.
 *
 * Kept as its own client component so SiteHeader can stay a server
 * component. That matters: making SiteHeader async/client previously
 * dragged Payload into the build of every static page and timed the
 * build out.
 */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = "hidden"

    closeRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        return
      }
      if (e.key !== "Tab") return
      // Focus trap — keep tabbing inside the panel while it's open.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="lg:hidden inline-flex items-center justify-center h-11 w-11 -mr-2 text-black hover:text-red-600"
      >
        <BurgerIcon />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 w-[86%] max-w-sm bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-200 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Menu
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center h-11 w-11 -mr-2 text-black hover:text-red-600"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="block px-5 py-4 text-base font-semibold uppercase tracking-wider text-black border-b border-zinc-100 hover:bg-zinc-50 hover:text-red-600"
                >
                  {item.label}
                </Link>
              ))}

              <p className="px-5 pt-6 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Your account
              </p>
              <Link
                href="/account"
                onClick={close}
                className="block px-5 py-3 text-base text-zinc-900 hover:bg-zinc-50 hover:text-red-600"
              >
                Account overview
              </Link>
              <Link
                href="/account/login"
                onClick={close}
                className="block px-5 py-3 text-base text-zinc-900 hover:bg-zinc-50 hover:text-red-600"
              >
                Sign in / Register
              </Link>
            </nav>

            <div className="shrink-0 border-t border-zinc-200 p-5 space-y-3">
              <a
                href="tel:+61243319007"
                className="flex items-center justify-center gap-2 h-12 bg-red-600 text-white font-bold uppercase text-sm tracking-wider hover:bg-red-700"
              >
                <PhoneIcon />
                (02) 4331 9007
              </a>
              <p className="text-xs text-zinc-600 text-center leading-relaxed">
                Mon–Fri 8:30am–5:30pm · Sat 9am–1pm · Sun closed
                <br />
                West Gosford, NSW Central Coast
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BurgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}
