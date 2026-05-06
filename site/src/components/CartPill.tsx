"use client"

import { useCart } from "@/lib/cart/CartContext"

export function CartPill() {
  const { itemCount, open, isHydrated } = useCart()

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Cart (${itemCount} items)`}
      className="relative inline-flex items-center gap-2 px-3 h-9 rounded-full border border-zinc-300 hover:border-zinc-900 transition-colors text-zinc-900"
    >
      <BagIcon />
      <span className="text-[13px] font-semibold">Cart</span>
      {/* Avoid showing 0 as a count badge before hydration to prevent flash. */}
      {isHydrated && itemCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold leading-none">
          {itemCount}
        </span>
      )}
    </button>
  )
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
