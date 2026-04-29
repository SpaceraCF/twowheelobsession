import type { CollectionConfig } from 'payload'

export const BikeCategories: CollectionConfig = {
  slug: 'bike-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'slug', 'displayOrder'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'group',
      type: 'select',
      required: true,
      options: [
        { label: 'Road', value: 'road' },
        { label: 'Off-road', value: 'off-road' },
        { label: 'ATV', value: 'atv' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 100,
      admin: { description: 'Lower numbers appear first.' },
    },
  ],
}
