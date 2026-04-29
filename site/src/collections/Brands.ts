import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'displayOrder'],
  },
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
