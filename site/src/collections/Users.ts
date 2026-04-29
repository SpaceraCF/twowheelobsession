import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
  },
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'staff',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
    },
  ],
}
