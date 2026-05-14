"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { logoutCustomer } from "@/lib/auth/actions"

type Customer = { firstName?: string; email: string } | null

/**
 * Header element shown on every main-site page. Fetches its own auth
 * state from /api/customers/me on mount — this keeps the parent page
 * statically renderable. Renders nothing during the hydration gap so
 * we don't flash "Sign in" → "Hi, name" or vice versa.
 */
export function HeaderAccountMenu() {
  const [state, setState] = useState<{ loaded: boolean; customer: Customer }>({
    loaded: false,
    customer: null,
  })

  useEffect(() => {
    let cancelled = false
    fetch("/api/customers/me", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null
        const data = (await res.json()) as { user?: Customer | null }
        return data.user ?? null
      })
      .then((customer) => {
        if (!cancelled) setState({ loaded: true, customer })
      })
      .catch(() => {
        if (!cancelled) setState({ loaded: true, customer: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!state.loaded) {
    // Empty placeholder during the hydration gap — same width as the
    // "Sign in" link so the layout doesn't jump.
    return <span className="inline-block w-16" aria-hidden />
  }

  if (!state.customer) {
    return (
      <Link
        href="/account/login"
        className="text-[13px] font-semibold uppercase tracking-wider text-black hover:text-red-600"
      >
        Sign in
      </Link>
    )
  }

  return <LoggedInMenu customer={state.customer} />
}

function LoggedInMenu({ customer }: { customer: { firstName?: string; email: string } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const label = customer.firstName ? `Hi, ${customer.firstName}` : "Account"

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-black hover:text-red-600"
      >
        <span>{label}</span>
        <Chevron />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-zinc-900 break-all mt-0.5">
              {customer.email}
            </p>
          </div>
          <MenuLink href="/account" label="Overview" onClick={() => setOpen(false)} />
          <MenuLink href="/account/profile" label="Profile" onClick={() => setOpen(false)} />
          <form action={logoutCustomer} className="border-t border-zinc-100">
            <button
              type="submit"
              className="block w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-red-600"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
    >
      {label}
    </Link>
  )
}

function Chevron() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
