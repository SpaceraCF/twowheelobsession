import type { Access, FieldAccess } from 'payload'

type PayloadIdentity = {
  collection?: string
  role?: string
} | null | undefined

/** Customer sessions are authenticated too; staff gates must check collection. */
export function isStaffUser<T extends PayloadIdentity>(
  user: T,
): user is NonNullable<T> & { collection: 'users'; role: 'staff' | 'admin' } {
  return (
    user?.collection === 'users' &&
    (user.role === 'staff' || user.role === 'admin')
  )
}

export function isAdminUser<T extends PayloadIdentity>(
  user: T,
): user is NonNullable<T> & { collection: 'users'; role: 'admin' } {
  return isStaffUser(user) && user?.role === 'admin'
}

export const staffOnly: Access = ({ req: { user } }) => isStaffUser(user)
export const adminOnly: Access = ({ req: { user } }) => isAdminUser(user)
export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdminUser(user)
