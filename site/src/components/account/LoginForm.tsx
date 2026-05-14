"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"

import { loginCustomer, type AuthState } from "@/lib/auth/actions"

const FIELD_CLASS =
  "mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"

export function LoginForm() {
  const params = useSearchParams()
  const redirectTo = params.get("next") ?? "/account"
  const [state, formAction] = useActionState<AuthState | null, FormData>(loginCustomer, null)

  return (
    <form action={formAction} className="grid gap-4 bg-white border border-zinc-200 rounded p-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-900">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={FIELD_CLASS}
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-900">
          Password <span className="text-red-600">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD_CLASS}
        />
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.password}</p>
        )}
      </div>

      <Submit />
    </form>
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
      {pending ? "Signing in…" : "Sign in"}
    </button>
  )
}
