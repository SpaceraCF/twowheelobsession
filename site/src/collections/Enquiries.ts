import type { CollectionConfig } from 'payload'

import { buildEnquiryEmail } from '../lib/notifications/build.ts'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['createdAt', 'type', 'name', 'email', 'status', 'assignedTo'],
    group: 'Enquiries',
  },
  access: {
    create: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const to = process.env.ENQUIRY_NOTIFY_EMAIL
        if (!to || !req.payload.email) return
        try {
          const { subject, text } = buildEnquiryEmail(doc as Record<string, unknown>)
          await req.payload.sendEmail({ to, subject, text })
        } catch (err) {
          req.payload.logger.error(
            { err },
            '[Enquiries] notification email failed (record still saved)',
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'New bike enquiry', value: 'new-bike' },
        { label: 'Used bike enquiry', value: 'used-bike' },
        { label: 'Parts & accessories', value: 'parts' },
        { label: 'General', value: 'general' },
      ],
    },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'newBike',
      type: 'relationship',
      relationTo: 'new-bikes',
      admin: { condition: (data) => data?.type === 'new-bike' },
    },
    {
      name: 'usedBike',
      type: 'relationship',
      relationTo: 'used-bikes',
      admin: { condition: (data) => data?.type === 'used-bike' },
    },
    { name: 'pageUrl', type: 'text', admin: { description: 'URL the form was submitted from.' } },
    { name: 'userAgent', type: 'text', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Closed — won', value: 'closed-won' },
        { label: 'Closed — lost', value: 'closed-lost' },
        { label: 'Spam', value: 'spam' },
      ],
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    {
      name: 'notes',
      type: 'array',
      admin: { description: 'Internal notes — never shown to customer.' },
      fields: [
        { name: 'note', type: 'textarea', required: true },
        { name: 'author', type: 'relationship', relationTo: 'users' },
      ],
    },
  ],
}
