import type { CollectionConfig } from 'payload'

// One row per SMS (inbound or outbound). Linked to a Conversation by
// `conversation`. Inbound rows come from the Twilio webhook; outbound
// rows come from staff replies via the conversation UI in the admin.
//
// Kept in a separate collection (rather than an array field on
// Conversations) so they paginate, index by date, and don't bloat the
// conversation document.

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'preview',
    defaultColumns: ['conversation', 'direction', 'preview', 'sentBy', 'createdAt'],
    group: 'Inbox',
    description:
      'Individual SMS records. The admin view lists every message across every conversation — use the Conversations view for a per-customer thread.',
  },
  access: {
    // Same as Conversations — server-side webhook creates inbound;
    // staff create outbound via the send-sms endpoint (which uses
    // the local API, bypasses access). Staff can read all messages.
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) =>
      Boolean(req.user && (req.user as { role?: string }).role === 'admin'),
    delete: ({ req }) =>
      Boolean(req.user && (req.user as { role?: string }).role === 'admin'),
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
      index: true,
    },
    {
      name: 'direction',
      type: 'select',
      required: true,
      options: [
        { label: 'Inbound (customer → us)', value: 'inbound' },
        { label: 'Outbound (us → customer)', value: 'outbound' },
      ],
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'preview',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'First 80 chars — used as the row title in admin lists.',
      },
    },
    {
      name: 'twilioMessageSid',
      type: 'text',
      index: true,
      admin: {
        description:
          'Twilio Message SID. Inbound: from the webhook payload. Outbound: from the Twilio API response when we sent it.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'received',
      options: [
        { label: 'Received', value: 'received' },
        { label: 'Queued', value: 'queued' },
        { label: 'Sent', value: 'sent' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'sentBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description:
          'Outbound only — which staff member typed and sent the reply.',
      },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        condition: (data) => data?.status === 'failed',
        description: 'Twilio error if the SMS failed to send.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const body = typeof data.body === 'string' ? data.body : ''
        data.preview = body.replace(/\s+/g, ' ').slice(0, 80)
        return data
      },
    ],
  },
}
