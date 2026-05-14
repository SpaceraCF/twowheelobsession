"use server"

// Server actions powering the customer auth pages. Wraps Payload's
// built-in /api/customers/* endpoints with `useActionState`-friendly
// shapes (mirrors the pattern used by the enquiry form). All cookies
// are set/cleared via Next's cookies() helper so the response can
// be returned by a Server Action rather than going through fetch
// from a client component.

import { cookies, headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export type AuthState = {
  ok: boolean
  error?: string
  fieldErrors?: Record<string, string>
  /** A success notice rendered instead of redirecting (e.g. forgot-password). */
  notice?: string
}

const COOKIE_NAME = `${process.env.PAYLOAD_COOKIE_PREFIX || 'payload'}-token`

// ---------- login ----------

export async function loginCustomer(
  _prev: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const redirectTo = String(formData.get('redirectTo') ?? '/account')

  const fieldErrors: Record<string, string> = {}
  if (!email) fieldErrors.email = 'Email required'
  if (!password) fieldErrors.password = 'Password required'
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: 'Please fill in both fields.' }
  }

  const payload = await getPayload({ config })
  try {
    const result = await payload.login({
      collection: 'customers',
      data: { email, password },
    })
    if (!result.token) {
      return { ok: false, error: 'Sign in failed. Please try again.' }
    }
    await setAuthCookie(result.token)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sign in failed.'
    // Payload returns "The email or password provided is incorrect." for
    // wrong creds; "This user is locked due to having too many..." for
    // lockout. Surface as-is.
    return { ok: false, error: msg }
  }

  redirect(safeRedirect(redirectTo))
}

// ---------- register ----------

export async function registerCustomer(
  _prev: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim() || undefined

  const fieldErrors: Record<string, string> = {}
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    fieldErrors.email = 'Valid email required'
  }
  if (!password || password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters'
  }
  if (!firstName) fieldErrors.firstName = 'Required'
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: 'Please fix the highlighted fields.' }
  }

  const payload = await getPayload({ config })
  try {
    await payload.create({
      collection: 'customers',
      // Cast — Payload's generated types don't expose the password
      // field on `data` because it's auth-managed.
      data: { email, password, firstName, lastName, phone } as never,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sign up failed.'
    // Payload error for duplicate email is "The following field is
    // invalid: email". Surface a friendlier message.
    if (msg.toLowerCase().includes('email')) {
      return {
        ok: false,
        error: 'An account with that email already exists. Try signing in or resetting your password.',
        fieldErrors: { email: 'Already registered' },
      }
    }
    return { ok: false, error: msg }
  }

  return {
    ok: true,
    notice:
      "Account created. We've sent a verification link to your email — click it to finish signing up.",
  }
}

// ---------- forgot password ----------

export async function forgotPassword(
  _prev: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) {
    return { ok: false, error: 'Email required', fieldErrors: { email: 'Required' } }
  }
  const payload = await getPayload({ config })
  try {
    await payload.forgotPassword({
      collection: 'customers',
      data: { email },
      disableEmail: false,
    })
  } catch {
    // Don't reveal whether the email exists — uniform response.
  }
  return {
    ok: true,
    notice:
      "If that email matches an account, we've sent a password reset link. Check your inbox.",
  }
}

// ---------- reset password ----------

export async function resetPassword(
  _prev: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const token = String(formData.get('token') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')

  const fieldErrors: Record<string, string> = {}
  if (!token) return { ok: false, error: 'Missing or expired reset link.' }
  if (!password || password.length < 8) {
    fieldErrors.password = 'At least 8 characters'
  }
  if (password !== confirm) {
    fieldErrors.confirmPassword = "Passwords don't match"
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, error: 'Please fix the highlighted fields.' }
  }

  const payload = await getPayload({ config })
  try {
    const result = await payload.resetPassword({
      collection: 'customers',
      data: { token, password },
      overrideAccess: true,
    })
    if (result.token) {
      await setAuthCookie(result.token)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not reset password.'
    return { ok: false, error: msg }
  }

  redirect('/account?reset=1')
}

// ---------- logout ----------

export async function logoutCustomer() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
  redirect('/')
}

// ---------- profile update ----------

export async function updateCustomerProfile(
  _prev: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const payload = await getPayload({ config })
  const hdrs = await nextHeaders()
  const { user } = await payload.auth({ headers: hdrs })
  if (!user || (user as { collection?: string }).collection !== 'customers') {
    return { ok: false, error: 'Not signed in.' }
  }

  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim() || undefined

  if (!firstName) {
    return {
      ok: false,
      error: 'First name required.',
      fieldErrors: { firstName: 'Required' },
    }
  }

  try {
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: { firstName, lastName, phone } as never,
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Update failed.',
    }
  }

  return { ok: true, notice: 'Profile updated.' }
}

// ---------- helpers ----------

async function setAuthCookie(token: string) {
  const jar = await cookies()
  jar.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // 30 days — matches `tokenExpiration` on the Customers collection.
    maxAge: 60 * 60 * 24 * 30,
  })
}

/** Prevents open-redirect from a tampered ?next= param. */
function safeRedirect(target: string): string {
  if (!target.startsWith('/') || target.startsWith('//')) return '/account'
  return target
}
