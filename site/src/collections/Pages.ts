import type { CollectionConfig } from 'payload'
import { staffOnly } from '../lib/auth/staff.ts'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: { create: staffOnly, read: staffOnly, update: staffOnly, delete: staffOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'content', type: 'richText' },
  ],
  versions: { drafts: true },
}
