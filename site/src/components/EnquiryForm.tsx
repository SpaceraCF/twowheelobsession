"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"

import { submitEnquiry, type EnquiryState } from "@/lib/actions/enquiry"

const TYPES = [
  { value: "new-bike", label: "New bike enquiry" },
  { value: "used-bike", label: "Used bike enquiry" },
  { value: "finance", label: "Finance enquiry" },
  { value: "parts", label: "Parts & accessories" },
  { value: "general", label: "General" },
]

const FINANCE_TERMS = [
  { value: "", label: "Not sure / staff to advise" },
  { value: "24", label: "24 months" },
  { value: "36", label: "36 months" },
  { value: "48", label: "48 months" },
  { value: "60", label: "60 months" },
  { value: "72", label: "72 months" },
]

// Single source of truth for form-control styling. `text-zinc-900` keeps
// VALUES dark; `placeholder:text-zinc-500` keeps placeholders legible
// without making them indistinguishable from real input. Inheriting the
// page's text color was rendering both too light on white.
const FIELD_CLASS =
  "mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"

export function EnquiryForm() {
  const params = useSearchParams()
  const [type, setType] = useState<string>("general")
  const [subject, setSubject] = useState<string>("")
  const [pageUrl, setPageUrl] = useState<string>("")
  const [state, formAction] = useActionState<EnquiryState | null, FormData>(submitEnquiry, null)

  useEffect(() => {
    const t = params.get("type")
    if (t && TYPES.some((x) => x.value === t)) setType(t)
    const bike = params.get("bike")
    const stock = params.get("stock")
    const price = params.get("price")
    if (bike) {
      const parts: string[] = [bike]
      if (stock) parts.push(`Stock #${stock}`)
      if (price) parts.push(`A$${price}`)
      setSubject(parts.join(" · "))
    }
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href)
    }
  }, [params])

  if (state?.ok) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-8 text-center">
        <h3 className="text-xl font-semibold text-emerald-900">Thanks — message sent</h3>
        <p className="mt-3 text-emerald-800">
          We'll be in touch shortly. For urgent enquiries call{" "}
          <a href="tel:+61243319007" className="font-semibold underline">
            (02) 4331 9007
          </a>
          .
        </p>
      </div>
    )
  }

  const isFinance = type === "finance"

  return (
    <form action={formAction} className="grid gap-5 bg-white border border-zinc-200 p-6 md:p-8">
      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-zinc-900">
          What's your enquiry about? <span className="text-red-600">*</span>
        </label>
        <select
          id="type"
          name="type"
          required
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={FIELD_CLASS}
        >
          {TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={state?.fieldErrors?.name} />
        <Field label="Email" name="email" type="email" required error={state?.fieldErrors?.email} />
        <Field label="Phone" name="phone" type="tel" />
        <Field
          label={isFinance ? "Bike of interest" : "Subject"}
          name="subject"
          defaultValue={subject}
          key={`subject-${subject}`}
        />
      </div>

      {isFinance && (
        <fieldset className="border border-zinc-200 rounded p-4 grid gap-4 sm:grid-cols-3 bg-zinc-50">
          <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Finance details (optional)
          </legend>
          <Field
            label="Deposit (A$)"
            name="financeDeposit"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2000"
          />
          <Field
            label="Trade-in"
            name="financeTradeIn"
            placeholder="Year, make, model"
          />
          <div>
            <label htmlFor="financeTerm" className="block text-sm font-medium text-zinc-900">
              Preferred term
            </label>
            <select
              id="financeTerm"
              name="financeTerm"
              defaultValue=""
              className={FIELD_CLASS}
            >
              {FINANCE_TERMS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-zinc-900">
          Message <span className="text-red-600">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={
            isFinance
              ? "Tell us anything that helps — preferred lender, employment status, timing, etc. Don't include sensitive financial info here; staff will request the formal application separately."
              : undefined
          }
          className={FIELD_CLASS}
        />
        {state?.fieldErrors?.message && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.message}</p>
        )}
      </div>

      <input type="hidden" name="pageUrl" value={pageUrl} />

      <SubmitButton isFinance={isFinance} />
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
  inputMode,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  error?: string
  defaultValue?: string
  placeholder?: string
  inputMode?: "numeric" | "decimal" | "text"
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
        inputMode={inputMode}
        className={FIELD_CLASS}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}

function SubmitButton({ isFinance }: { isFinance: boolean }) {
  const { pending } = useFormStatus()
  const idle = isFinance ? "Request finance call-back" : "Send enquiry"
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center px-6 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed self-start"
    >
      {pending ? "Sending…" : idle}
    </button>
  )
}
