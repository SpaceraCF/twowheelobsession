import type { Access, CollectionConfig, FieldAccess } from 'payload'

// Only admin-role users can invite, edit, or remove other users.
// Staff can still see their own row (so the admin profile page
// works) but can't escalate themselves to admin or wipe a colleague.
//
// Collection-level `Access` returns true / false / a `Where` query
// (allow only matching docs). Field-level `FieldAccess` returns
// boolean only — no Where clause — so we keep two flavours.
const isAdmin: Access = ({ req: { user } }) =>
  Boolean(user && (user as { role?: string }).role === 'admin')

const isAdminField: FieldAccess = ({ req: { user } }) =>
  Boolean(user && (user as { role?: string }).role === 'admin')

const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if ((user as { role?: string }).role === 'admin') return true
  // Staff can read / update their own user record only.
  return { id: { equals: user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    description:
      'Staff and admin accounts. Only admins can invite or remove users.',
  },
  auth: true,
  access: {
    create: isAdmin,
    delete: isAdmin,
    update: isAdminOrSelf,
    read: isAdminOrSelf,
    // Admin-only access also covers any future field-level checks via
    // the `admin.role` value. Add field-level access if specific
    // fields (e.g. `role`) need stricter rules.
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'staff',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      access: {
        // Only admins can change a user's role — prevents staff from
        // self-promoting on their own profile page.
        update: isAdminField,
      },
    },
  ],
}
