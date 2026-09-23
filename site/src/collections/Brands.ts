import type { CollectionConfig } from 'payload'
import { staffOnly } from '../lib/auth/staff.ts'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'displayOrder'],
  },
  access: { create: staffOnly, read: staffOnly, update: staffOnly, delete: staffOnly },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 100,
      admin: { description: 'Lower numbers appear first.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide brand without deleting (e.g. discontinued lines).' },
    },
  ],
}
