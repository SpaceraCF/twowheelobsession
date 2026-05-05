"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

import { submitEnquiry, type EnquiryState } from "@/lib/actions/enquiry"

// Parts-focused enquiry form for the Yamaha Parts Australia site.
// Pre-sets `type=parts` (the customer doesn't need to choose) and uses
// the parts-site brand colour (deep navy) for the submit button instead
// of the main-site red. Writes to the same Payload `enquiries`
// collection — staff see all enquiries from both domains in one queue,
// distinguishable via the `pageUrl` field.

const FIELD_CLASS =
  "mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0d1f4d] focus:border-transparent"

export function PartsEnquiryForm() {
  const [pageUrl, setPageUrl] = useState<string>("")
  const [state, formAction] = useActionState<EnquiryState | null, FormData>(submitEnquiry, null)

  useEffect(() => {
    if (typeof window !== "undefined") setPageUrl(window.location.href)
  }, [])

  if (state?.ok) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-8 text-center rounded-md">
        <h3 className="text-xl font-semibold text-emerald-900">
          Thanks — parts enquiry sent
        </h3>
        <p className="mt-3 text-emerald-800">
          We'll come back with stock, price and shipping shortly. For urgent
          orders call{" "}
          <a href="tel:+61243319007" className="font-semibold underline">
            (02) 4331 9007
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="grid gap-5 bg-white border border-zinc-200 p-6 md:p-8 rounded-md">
      <h3 className="text-lg font-bold text-zinc-900">Send a parts enquiry</h3>

      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {state.error}
        </p>
      )}

      <input type="hidden" name="type" value="parts" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={state?.fieldErrors?.name} />
        <Field label="Email" name="email" type="email" required error={state?.fieldErrors?.email} />
        <Field label="Phone" name="phone" type="tel" />
        <Field
          label="Bike (year, model, VIN if known)"
          name="subject"
          placeholder="e.g. 2022 MT-07, VIN: ABC..."
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-zinc-900">
          Parts you're after <span className="text-red-600">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="List part numbers from the finder above, or describe what you need. We'll quote stock, price and shipping."
          className={FIELD_CLASS}
        />
        {state?.fieldErrors?.message && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.message}</p>
        )}
      </div>

      <input type="hidden" name="pageUrl" value={pageUrl} />

      <SubmitButton />

      <p className="text-xs text-zinc-500">
        We'll reply by email within one business day. For anything urgent, call
        the workshop direct.
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  error?: string
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-900">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={FIELD_CLASS}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center px-6 bg-[#0d1f4d] text-white font-semibold uppercase text-sm tracking-wider hover:bg-[#0a1739] disabled:opacity-50 disabled:cursor-not-allowed self-start"
    >
      {pending ? "Sending…" : "Send parts enquiry"}
    </button>
  )
}
