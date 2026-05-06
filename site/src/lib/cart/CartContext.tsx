"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"

import {
  type CartLineItem,
  calcItemCount,
  calcSubtotal,
  isCartAddMessage,
} from "./types"

const STORAGE_KEY = "ypa.cart.v1"
const STORAGE_VERSION = 1

type CartState = { items: CartLineItem[] }

type CartAction =
  | { type: "hydrate"; items: CartLineItem[] }
  | { type: "add"; item: CartLineItem }
  | { type: "setQty"; sku: string; qty: number }
  | { type: "remove"; sku: string }
  | { type: "clear" }

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items }
    case "add": {
      const idx = state.items.findIndex((i) => i.sku === action.item.sku)
      if (idx >= 0) {
        const items = state.items.slice()
        items[idx] = { ...items[idx], qty: items[idx].qty + action.item.qty }
        return { items }
      }
      return { items: [...state.items, action.item] }
    }
    case "setQty": {
      if (action.qty <= 0) {
        return { items: state.items.filter((i) => i.sku !== action.sku) }
      }
      return {
        items: state.items.map((i) => (i.sku === action.sku ? { ...i, qty: action.qty } : i)),
      }
    }
    case "remove":
      return { items: state.items.filter((i) => i.sku !== action.sku) }
    case "clear":
      return { items: [] }
    default:
      return state
  }
}

type CartContextValue = {
  items: CartLineItem[]
  itemCount: number
  subtotal: number
  isOpen: boolean
  isHydrated: boolean
  open: () => void
  close: () => void
  add: (item: CartLineItem) => void
  setQty: (sku: string, qty: number) => void
  remove: (sku: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { version?: number; items?: CartLineItem[] }
        if (parsed?.version === STORAGE_VERSION && Array.isArray(parsed.items)) {
          dispatch({ type: "hydrate", items: parsed.items })
        }
      }
    } catch {
      // Corrupt storage — ignore and start empty. Browser/private-mode
      // can also disable localStorage entirely.
    }
    setIsHydrated(true)
  }, [])

  // Persist on every change after hydration.
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, items: state.items }),
      )
    } catch {
      /* private-mode / quota errors — silent */
    }
  }, [state.items, isHydrated])

  // Listen for `postMessage` events from the EPC iframe bridge.
  useEffect(() => {
    if (typeof window === "undefined") return
    function onMessage(ev: MessageEvent) {
      if (!isCartAddMessage(ev.data)) return
      // Same-origin only — the iframe is /oem-widget on our own
      // domain, so reject any cross-origin posting outright.
      if (ev.origin !== window.location.origin) return
      dispatch({ type: "add", item: ev.data.payload })
      setIsOpen(true)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: calcItemCount(state.items),
      subtotal: calcSubtotal(state.items),
      isOpen,
      isHydrated,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: (item) => {
        dispatch({ type: "add", item })
        setIsOpen(true)
      },
      setQty: (sku, qty) => dispatch({ type: "setQty", sku, qty }),
      remove: (sku) => dispatch({ type: "remove", sku }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [state.items, isOpen, isHydrated],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}

// Used by the success page after PayPal capture — clear the cart on
// the client without needing a full <CartProvider> remount.
export function clearCartStorage() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
