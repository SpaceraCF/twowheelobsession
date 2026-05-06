"use client"

import Link from "next/link"
import { useEffect } from "react"

import { useCart } from "@/lib/cart/CartContext"
import { fmtAud } from "@/lib/cart/types"

export function CartDrawer() {
  const { items, subtotal, isOpen, close, setQty, remove } = useCart()

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cart"
      className="fixed inset-0 z-50 flex"
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={close}
        className="flex-1 bg-black/50 backdrop-blur-sm"
      />
      <aside className="w-full max-w-md h-full bg-white text-zinc-900 shadow-2xl flex flex-col">
        <header className="flex items-center justify-between gap-4 px-6 py-5 border-b border-zinc-200">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">
              Your cart
            </p>
            <h2 className="text-xl font-extrabold tracking-tight">Genuine Yamaha parts</h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="w-9 h-9 rounded-full border border-zinc-200 hover:border-zinc-900 inline-flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </header>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-zinc-200">
              {items.map((item) => (
                <li key={item.sku} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 font-mono">{item.sku}</p>
                      {item.bikeContext && (
                        <p className="mt-1 text-xs text-zinc-500 italic">{item.bikeContext}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 whitespace-nowrap">
                      {fmtAud(item.unitPrice * item.qty)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <QtyStepper
                      qty={item.qty}
                      onChange={(qty) => setQty(item.sku, qty)}
                    />
                    <button
                      type="button"
                      onClick={() => remove(item.sku)}
                      className="text-xs font-semibold text-zinc-500 hover:text-red-600 underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-zinc-200 px-6 py-5 space-y-4 bg-zinc-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">Subtotal</span>
                <span className="font-bold text-zinc-900">{fmtAud(subtotal)}</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Shipping and total are calculated at checkout. Prices include
                GST.
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="inline-flex w-full h-12 items-center justify-center px-6 bg-red-600 text-white font-bold uppercase text-sm tracking-wider hover:bg-red-700 transition-colors"
              >
                Checkout
              </Link>
              <button
                type="button"
                onClick={close}
                className="inline-flex w-full h-10 items-center justify-center text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

function EmptyState() {
  const { close } = useCart()
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-zinc-900">Your cart is empty</h3>
      <p className="mt-2 text-sm text-zinc-600 leading-relaxed max-w-xs">
        Find your Yamaha part in the catalogue below and add it to your cart.
      </p>
      <button
        type="button"
        onClick={close}
        className="mt-6 inline-flex h-11 items-center px-5 bg-red-600 text-white font-semibold uppercase text-xs tracking-wider hover:bg-red-700"
      >
        Browse parts
      </button>
    </div>
  )
}

function QtyStepper({ qty, onChange }: { qty: number; onChange: (qty: number) => void }) {
  return (
    <div className="inline-flex items-center border border-zinc-300 rounded">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, qty - 1))}
        aria-label="Decrease quantity"
        className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-red-600"
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-semibold text-zinc-900" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
        className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-red-600"
      >
        +
      </button>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
