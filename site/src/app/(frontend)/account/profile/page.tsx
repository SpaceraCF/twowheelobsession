import { redirect } from "next/navigation"

import { ProfileForm } from "@/components/account/ProfileForm"
import { getCurrentCustomer } from "@/lib/auth/customer"

export const metadata = { title: "Profile" }

export default async function ProfilePage() {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/account/login?next=/account/profile")

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-zinc-900">Your profile</h2>
      <p className="mt-2 text-sm text-zinc-700">
        Update your name, phone, and contact details. Email changes need to
        come through us — call (02) 4331 9007.
      </p>

      <div className="mt-6">
        <ProfileForm
          initial={{
            firstName: customer.firstName ?? "",
            lastName: customer.lastName ?? "",
            phone: customer.phone ?? "",
            email: customer.email,
          }}
        />
      </div>
    </div>
  )
}
