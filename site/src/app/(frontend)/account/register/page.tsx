import Link from "next/link"
import { redirect } from "next/navigation"

import { RegisterForm } from "@/components/account/RegisterForm"
import { getCurrentCustomer } from "@/lib/auth/customer"

export const metadata = { title: "Create account" }

export default async function RegisterPage() {
  const customer = await getCurrentCustomer()
  if (customer) redirect("/account")

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-zinc-900">Create your account</h2>
      <p className="mt-2 text-sm text-zinc-700">
        Set up an account to track parts orders, save your bikes for fitment,
        and book services. Takes about a minute.
      </p>

      <div className="mt-6">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm text-zinc-700">
        Already have one?{" "}
        <Link href="/account/login" className="text-red-600 font-semibold hover:underline">
          Sign in
        </Link>
        .
      </p>
    </div>
  )
}
