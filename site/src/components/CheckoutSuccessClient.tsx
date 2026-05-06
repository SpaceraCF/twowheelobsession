"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { clearCartStorage } from "@/lib/cart/CartContext"

// Two responsibilities:
// 1. Wipe localStorage cart on mount (the redirect from PayPal can land
//    here directly without re-running the CheckoutFlow's clear). Idempotent.
// 2. Render the order number from the URL so customers can copy/quote it.
export function CheckoutSuccessClient() {
  const params = useSearchParams()
  const orderNumber = params.get("order") ?? ""

  useEffect(() => {
    clearCartStorage()
  }, [])

  if (!orderNumber) return null

  return (
    <p className="mt-4 inline-block bg-zinc-900 text-white font-mono text-sm px-4 py-2 rounded">
      Order ref: <span className="font-bold">{orderNumber}</span>
    </p>
  )
}
