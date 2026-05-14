import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { LoginForm } from "@/components/account/LoginForm"
import { getCurrentCustomer } from "@/lib/auth/customer"

export const metadata = { title: "Sign in" }

export default async function LoginPage() {
  const customer = await getCurrentCustomer()
  if (customer) redirect("/account")

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-zinc-900">Sign in</h2>
      <p className="mt-2 text-sm text-zinc-700">
        Enter the email and password you used to create your account.
      </p>

      <div className="mt-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-zinc-700">
        Don't have an account?{" "}
        <Link href="/account/register" className="text-red-600 font-semibold hover:underline">
          Create one
        </Link>
        .
      </p>
      <p className="mt-2 text-sm text-zinc-700">
        Forgot your password?{" "}
        <Link href="/account/forgot-password" className="text-red-600 font-semibold hover:underline">
          Reset it
        </Link>
        .
      </p>
    </div>
  )
}
