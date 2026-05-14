import Link from "next/link"

import { ForgotForm } from "@/components/account/ForgotForm"

export const metadata = { title: "Reset password" }

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-zinc-900">Forgot your password?</h2>
      <p className="mt-2 text-sm text-zinc-700">
        Enter your email and we'll send you a reset link. The link expires in
        an hour.
      </p>

      <div className="mt-6">
        <ForgotForm />
      </div>

      <p className="mt-6 text-sm text-zinc-700">
        Remembered it?{" "}
        <Link href="/account/login" className="text-red-600 font-semibold hover:underline">
          Sign in
        </Link>
        .
      </p>
    </div>
  )
}
