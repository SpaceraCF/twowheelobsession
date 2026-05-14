"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { registerCustomer, type AuthState } from "@/lib/auth/actions"

const FIELD_CLASS =
  "mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthState | null, FormData>(registerCustomer, null)

  if (state?.ok && state.notice) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded">
        <h3 className="font-semibold text-emerald-900">Almost done</h3>
        <p className="mt-2 text-sm text-emerald-800">{state.notice}</p>
        <p className="mt-3 text-xs text-emerald-700">
          Didn't get the email? Check spam, or{" "}
          <Link href="/account/login" className="underline">
            try signing in
          </Link>{" "}
          — you can re-request verification from the login screen.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="grid gap-4 bg-white border border-zinc-200 rounded p-6">
      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="firstName"
          label="First name"
          autoComplete="given-name"
          required
          error={state?.fieldErrors?.firstName}
        />
        <Field
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          error={state?.fieldErrors?.lastName}
        />
      </div>
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={state?.fieldErrors?.email}
      />
      <Field
        name="phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        error={state?.fieldErrors?.phone}
      />
      <Field
        name="password"
        label="Password (min 8 characters)"
        type="password"
        autoComplete="new-password"
        required
        error={state?.fieldErrors?.password}
      />

      <p className="text-xs text-zinc-500">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="underline">
          privacy policy
        </Link>
        .
      </p>

      <Submit />
    </form>
  )
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  autoComplete,
  error,
}: {
  name: string
  label: string
  type?: string
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
      className="inline-flex h-11 items-center justify-center px-5 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  )
}
