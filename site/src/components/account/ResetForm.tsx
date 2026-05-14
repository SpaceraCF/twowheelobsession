"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"

import { resetPassword, type AuthState } from "@/lib/auth/actions"

const FIELD_CLASS =
  "mt-1 block w-full border border-zinc-300 rounded px-3 py-2 text-sm bg-white text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"

export function ResetForm() {
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const [state, formAction] = useActionState<AuthState | null, FormData>(resetPassword, null)

  if (!token) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-6 rounded text-sm text-amber-900">
        Missing reset token in the URL. Use the link from your email — if you
        followed it and still see this, request a fresh one.
      </div>
    )
  }

  return (
    <form action={formAction} className="grid gap-4 bg-white border border-zinc-200 rounded p-6">
      <input type="hidden" name="token" value={token} />

      {state?.error && !state.fieldErrors && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-900">
          New password <span className="text-red-600">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={FIELD_CLASS}
        />
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-900">
          Confirm password <span className="text-red-600">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={FIELD_CLASS}
        />
        {state?.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.confirmPassword}</p>
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
      {pending ? "Updating…" : "Update password"}
    </button>
  )
}
