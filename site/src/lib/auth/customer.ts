// Server-only helper for the customer account portal. Reads the
// request cookies, asks Payload who's logged in, and returns the
// Customer doc only if the session belongs to the customers
// collection (not staff Users). This prevents staff from
// accidentally landing on /account/* with their admin session.

import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export type CurrentCustomer = {
  id: number | string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

/**
 * Returns the logged-in customer, or `null` if there's no customer
 * session. Note: a staff user logged into /admin won't satisfy this
 * — only customer-collection sessions count.
 */
export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  const payload = await getPayload({ config })
  const hdrs = await nextHeaders()
  const { user } = await payload.auth({ headers: hdrs })
  if (!user) return null
  // Payload v3 returns `collection` on `user` when it's authenticated.
  const collection = (user as { collection?: string }).collection
  if (collection !== 'customers') return null
  return {
    id: user.id,
    email: user.email,
    firstName: (user as { firstName?: string }).firstName,
    lastName: (user as { lastName?: string }).lastName,
    phone: (user as { phone?: string }).phone,
  }
}
