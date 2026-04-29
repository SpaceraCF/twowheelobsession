"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { submitServiceRequest, type ServiceRequestState } from "@/lib/actions/service-request"

const SERVICE_TYPES: Array<{ value: string; label: string }> = [
  { value: "scheduled", label: "Scheduled service" },
  { value: "repair", label: "Repair" },
  { value: "tyres", label: "Tyres" },
  { value: "inspection", label: "Roadworthy / inspection" },
  { value: "warranty", label: "Warranty" },
  { value: "other", label: "Other" },
]

export function ServiceRequestForm() {
  const [state, formAction] = useActionState<ServiceRequestState | null, FormData>(
    submitServiceRequest,
    null,
  )

  if (state?.ok) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-8 text-center">
        <h3 className="text-xl font-semibold text-emerald-900">Request received</h3>
        <p className="mt-3 text-emerald-800">
          Thanks — our workshop will be in touch shortly. For urgent jobs call{" "}
          <a href="tel:+61243319007" className="font-semibold underline">
            (02) 4331 9007
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="grid gap-5 bg-white border border-zinc-200 p-6 md:p-8">
      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={state?.fieldErrors?.name} />
        <Field label="Email" name="email" type="email" required error={state?.fieldErrors?.email} />
        <Field label="Phone" name="phone" type="tel" required error={state?.fieldErrors?.phone} />
        <Field label="Preferred date" name="preferredDate" type="date" />
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-3 border-t border-zinc-200 pt-5">
        <legend className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 mb-1 col-span-3">
          Bike details
        </legend>
        <Field label="Make" name="bikeMake" required error={state?.fieldErrors?.bikeMake} />
        <Field label="Model" name="bikeModel" required error={state?.fieldErrors?.bikeModel} />
        <Field label="Year" name="bikeYear" type="number" min="1950" max="2030" />
        <Field label="Kilometres" name="bikeKms" type="number" min="0" />
        <Field label="Rego (if registered)" name="bikeRego" />
      </fieldset>

      <div className="border-t border-zinc-200 pt-5">
        <label htmlFor="serviceType" className="block text-sm font-medium text-zinc-900">
          Service type <span className="text-red-600">*</span>
        </label>
        <select
          id="serviceType"
          name="serviceType"
          required
          defaultValue=""
          className="mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
        >
          <option value="" disabled>Select…</option>
          {SERVICE_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {state?.fieldErrors?.serviceType && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.serviceType}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-900">
          What's going on? <span className="text-red-600">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="Tell us as much as you can — symptoms, recent work, deadlines."
          className="mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
        {state?.fieldErrors?.description && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.description}</p>
        )}
      </div>

      <SubmitButton />

      <p className="text-xs text-zinc-500">
        We aim to respond within one business day. For same-day jobs please call us.
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
  min,
  max,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  error?: string
  min?: string | number
  max?: string | number
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
        min={min}
        max={max}
        className="mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
      className="inline-flex h-12 items-center px-6 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed self-start"
    >
      {pending ? "Sending…" : "Submit service request"}
    </button>
  )
}
