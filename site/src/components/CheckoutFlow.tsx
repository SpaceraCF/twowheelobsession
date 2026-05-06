"use client"

import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { clearCartStorage, useCart } from "@/lib/cart/CartContext"
import {
  type ShippingMethod,
  SHIPPING_OPTIONS,
  fmtAud,
  shippingCostFor,
} from "@/lib/cart/types"

const FIELD_CLASS =
  "mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"

type CheckoutFlowProps = {
  paypalClientId: string | null
  paypalEnv: string
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: PayPalButtonOptions) => { render: (selector: string | HTMLElement) => Promise<void> }
    }
  }
}

type PayPalButtonOptions = {
  style?: { shape?: string; layout?: string; color?: string; label?: string }
  createOrder?: () => Promise<string>
  onApprove?: (data: { orderID: string }) => Promise<void>
  onError?: (err: unknown) => void
  onCancel?: () => void
}

export function CheckoutFlow({ paypalClientId, paypalEnv }: CheckoutFlowProps) {
  const { items, subtotal, isHydrated } = useCart()
  const empty = isHydrated && items.length === 0

  if (!isHydrated) {
    return <div className="h-32" aria-hidden />
  }

  if (empty) {
    return (
      <div className="bg-white border border-zinc-200 rounded-md p-10 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Your cart is empty</h2>
        <p className="mt-3 text-zinc-600">
          Find a Yamaha part to add to your cart, then come back here to pay.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center px-5 bg-red-600 text-white font-semibold uppercase text-xs tracking-wider hover:bg-red-700"
        >
          Browse parts
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <CheckoutForm paypalClientId={paypalClientId} paypalEnv={paypalEnv} />
      <OrderSummary subtotal={subtotal} />
    </div>
  )
}

function CheckoutForm({ paypalClientId, paypalEnv }: { paypalClientId: string | null; paypalEnv: string }) {
  const { items, subtotal } = useCart()
  const router = useRouter()
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const renderedRef = useRef(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state.
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("au-flat")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [suburb, setSuburb] = useState("")
  const [state, setState] = useState("NSW")
  const [postcode, setPostcode] = useState("")

  const shipping = shippingCostFor(shippingMethod)
  const total = subtotal + shipping

  // Build the request body once per state change so the PayPal callbacks
  // see the freshest values without re-binding the buttons.
  const bodyRef = useRef({
    customer: { name, email, phone },
    shippingMethod,
    shippingAddress:
      shippingMethod === "au-flat"
        ? { addressLine1, addressLine2, suburb, state, postcode }
        : undefined,
    lineItems: items,
  })
  bodyRef.current = {
    customer: { name, email, phone },
    shippingMethod,
    shippingAddress:
      shippingMethod === "au-flat"
        ? { addressLine1, addressLine2, suburb, state, postcode }
        : undefined,
    lineItems: items,
  }

  const validate = useCallback(() => {
    if (!name.trim()) return "Your name is required."
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email."
    if (!phone.trim() || phone.replace(/\D/g, "").length < 6) return "Enter a phone number."
    if (shippingMethod === "au-flat") {
      if (!addressLine1.trim()) return "Street address required for shipping."
      if (!suburb.trim()) return "Suburb required."
      if (!/^\d{4}$/.test(postcode)) return "Postcode must be 4 digits."
    }
    return null
  }, [name, email, phone, shippingMethod, addressLine1, suburb, postcode])

  const renderPayPalButtons = useCallback(() => {
    if (!buttonRef.current || renderedRef.current || !window.paypal) return
    renderedRef.current = true

    const buttons = window.paypal.Buttons({
      style: { shape: "rect", layout: "vertical", color: "gold", label: "paypal" },
      createOrder: async () => {
        const v = validate()
        if (v) {
          setErrorMsg(v)
          throw new Error(v)
        }
        setErrorMsg(null)
        setSubmitting(true)
        const res = await fetch("/api/checkout/create-order", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(bodyRef.current),
        })
        if (!res.ok) {
          setSubmitting(false)
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          const msg = data.error ?? "Couldn't start checkout. Please try again."
          setErrorMsg(msg)
          throw new Error(msg)
        }
        const data = (await res.json()) as { paypalOrderId: string }
        return data.paypalOrderId
      },
      onApprove: async (data) => {
        const res = await fetch("/api/checkout/capture", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...bodyRef.current, paypalOrderId: data.orderID }),
        })
        setSubmitting(false)
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          setErrorMsg(body.error ?? "Payment received but the order didn't save. Please call us.")
          return
        }
        const body = (await res.json()) as { orderNumber: string }
        clearCartStorage()
        router.push(`/checkout/success?order=${encodeURIComponent(body.orderNumber)}`)
        // Cart context still has the items in memory after redirect; the
        // success page wipes localStorage so a refresh starts clean.
      },
      onError: (err) => {
        setSubmitting(false)
        console.error("[paypal] error", err)
        setErrorMsg("PayPal couldn't complete checkout. Please try again, or call (02) 4331 9007.")
      },
      onCancel: () => {
        setSubmitting(false)
      },
    })

    buttons.render(buttonRef.current).catch((err: unknown) => {
      console.error("[paypal] failed to render buttons", err)
    })
  }, [validate, router])

  useEffect(() => {
    if (sdkReady) renderPayPalButtons()
  }, [sdkReady, renderPayPalButtons])

  const sdkSrc = useMemo(() => {
    if (!paypalClientId) return null
    const params = new URLSearchParams({
      "client-id": paypalClientId,
      currency: "AUD",
      intent: "capture",
      "disable-funding": "credit,card",
    })
    return `https://www.paypal.com/sdk/js?${params.toString()}`
  }, [paypalClientId])

  return (
    <div className="bg-white border border-zinc-200 rounded-md p-6 md:p-8 space-y-6">
      {sdkSrc && (
        <Script
          src={sdkSrc}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
          onError={() => setErrorMsg("Couldn't load the PayPal checkout. Refresh and try again.")}
        />
      )}

      <h2 className="text-lg font-bold text-zinc-900">Your details</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" value={name} onChange={setName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Phone" type="tel" value={phone} onChange={setPhone} required />
      </div>

      <div>
        <p className="text-sm font-semibold text-zinc-900">Fulfilment</p>
        <div className="mt-2 grid gap-2">
          {SHIPPING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 border rounded p-3 cursor-pointer transition-colors ${
                shippingMethod === opt.value
                  ? "border-red-600 bg-red-50/50"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={opt.value}
                checked={shippingMethod === opt.value}
                onChange={() => setShippingMethod(opt.value)}
                className="mt-1 accent-red-600"
              />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-zinc-900">{opt.label}</span>
                <span className="block text-xs text-zinc-600 mt-0.5">{opt.description}</span>
              </span>
              <span className="text-sm font-semibold text-zinc-900 whitespace-nowrap">
                {opt.cost === 0 ? "Free" : fmtAud(opt.cost)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {shippingMethod === "au-flat" && (
        <div className="space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700">
            Shipping address
          </h3>
          <Field label="Street address" value={addressLine1} onChange={setAddressLine1} required />
          <Field label="Apartment / suite (optional)" value={addressLine2} onChange={setAddressLine2} />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Suburb" value={suburb} onChange={setSuburb} required />
            <div>
              <label htmlFor="ck-state" className="block text-sm font-medium text-zinc-900">
                State <span className="text-red-600">*</span>
              </label>
              <select
                id="ck-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={FIELD_CLASS}
              >
                {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Field
              label="Postcode"
              value={postcode}
              onChange={setPostcode}
              required
              inputMode="numeric"
              maxLength={4}
            />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-zinc-200">
        {errorMsg && (
          <p className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {errorMsg}
          </p>
        )}

        {paypalClientId ? (
          <>
            <p className="text-sm text-zinc-700 mb-3">
              Pay securely via PayPal. Your card details never touch our site.
            </p>
            <div ref={buttonRef} aria-busy={submitting} />
            {paypalEnv === "sandbox" && (
              <p className="mt-3 text-[11px] text-zinc-500 italic">
                Sandbox mode — no real money will move. Use a PayPal sandbox buyer account.
              </p>
            )}
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded">
            <p className="text-sm font-semibold text-amber-900">
              Online checkout isn't switched on yet
            </p>
            <p className="mt-1 text-sm text-amber-800">
              We're configuring PayPal — for now, please call us on{" "}
              <a href="tel:+61243319007" className="font-semibold underline">
                (02) 4331 9007
              </a>{" "}
              or send a parts enquiry and we'll process your order over the phone.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderSummary({ subtotal }: { subtotal: number }) {
  const { items } = useCart()
  return (
    <aside className="bg-white border border-zinc-200 rounded-md p-6 md:p-8 h-fit lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-zinc-900">Order summary</h2>
      <ul className="mt-5 divide-y divide-zinc-200 text-sm">
        {items.map((item) => (
          <li key={item.sku} className="py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-zinc-900">{item.name}</p>
              <p className="text-xs text-zinc-500 font-mono">
                {item.sku} · qty {item.qty}
              </p>
            </div>
            <p className="font-semibold text-zinc-900 whitespace-nowrap">
              {fmtAud(item.unitPrice * item.qty)}
            </p>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-1.5 text-sm border-t border-zinc-200 pt-4">
        <div className="flex justify-between text-zinc-700">
          <dt>Subtotal</dt>
          <dd>{fmtAud(subtotal)}</dd>
        </div>
        <p className="text-xs text-zinc-500">Shipping calculated based on fulfilment choice.</p>
      </dl>
    </aside>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  inputMode,
  maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  inputMode?: "numeric" | "decimal" | "text" | "tel" | "email"
  maxLength?: number
}) {
  const id = `ck-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-900">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CLASS}
      />
    </div>
  )
}
