"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { updateCustomerProfile, type AuthState } from "@/lib/auth/actions"

const FIELD_CLASS =
  "mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"

type Initial = {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction] = useActionState<AuthState | null, FormData>(
    updateCustomerProfile,
    null,
  )

  return (
    <form action={formAction} className="grid gap-4 bg-white border border-zinc-200 rounded p-6">
      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {state.error}
        </p>
      )}
      {state?.ok && state.notice && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">
          {state.notice}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="firstName"
          label="First name"
          defaultValue={initial.firstName}
          autoComplete="given-name"
          required
          error={state?.fieldErrors?.firstName}
        />
        <Field
          name="lastName"
          label="Last name"
          defaultValue={initial.lastName}
          autoComplete="family-name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-500">Email</label>
        <input
          value={initial.email}
          disabled
          className={`${FIELD_CLASS} bg-zinc-50 text-zinc-500 cursor-not-allowed`}
        />
        <p className="mt-1 text-xs text-zinc-500">
          Email is your sign-in identity — to change it, call us on (02) 4331 9007.
        </p>
      </div>

      <Field
        name="phone"
        label="Phone"
        type="tel"
        defaultValue={initial.phone}
        autoComplete="tel"
      />

      <Submit />
    </form>
  )
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required = false,
  autoComplete,
  error,
}: {
  name: string
  label: string
  type?: string
  defaultValue?: string
  required?: boolean
  autoComplete?: string
  error?: string
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
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        className={FIELD_CLASS}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center px-5 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700 disabled:opacity-50 self-start"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  )
}
