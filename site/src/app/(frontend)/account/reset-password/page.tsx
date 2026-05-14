import Link from "next/link"
import { Suspense } from "react"

import { ResetForm } from "@/components/account/ResetForm"

export const metadata = { title: "Choose a new password" }

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-zinc-900">Choose a new password</h2>
      <p className="mt-2 text-sm text-zinc-700">
        At least 8 characters. After this you'll be signed in automatically.
      </p>

      <div className="mt-6">
        <Suspense
          fallback={
            <div className="bg-white border border-zinc-200 rounded p-6 text-sm text-zinc-500">
              Loading reset form…
            </div>
          }
        >
          <ResetForm />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-zinc-700">
        Link expired or broken?{" "}
        <Link href="/account/forgot-password" className="text-red-600 font-semibold hover:underline">
          Request a new one
        </Link>
        .
      </p>
    </div>
  )
}
