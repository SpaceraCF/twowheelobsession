import type { CollectionConfig } from 'payload'

// One row per customer phone number. Aggregates all inbound /
// outbound SMS for that customer into a single thread.
//
// Created by the Twilio inbound webhook (`/api/twilio/sms-inbound`)
// the first time a customer texts in; updated on every subsequent
// message (lastMessageAt, lastMessagePreview, unreadCount).
//
// Customer name is captured as the team learns it — the customer's
// first SMS only gives us their phone number. Staff can edit
// `displayName` in the admin once they know who they're talking to.

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'displayLabel',
    defaultColumns: [
      'displayLabel',
      'unreadCount',
      'status',
      'assignedTo',
      'lastMessagePreview',
      'lastMessageAt',
    ],
    group: 'Inbox',
    description:
      "Shared SMS inbox. Each row is a customer thread — open one to see the message history and reply. Replies go out as SMS from the dealer's Twilio number.",
    listSearchableFields: ['phoneNumber', 'displayName'],
    components: {
      // Mounts the chat-style message thread + reply box ABOVE the
      // standard Payload fields when staff opens a conversation.
      edit: {
        beforeDocumentControls: [
          '/admin/components/ConversationThread.tsx#default',
        ],
      },
    },
  },
  access: {
    // Logged-in staff can read / update / assign. The inbound webhook
    // creates new rows via the Payload Local API which bypasses
    // access checks; we never accept anonymous public creates.
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) =>
      Boolean(req.user && (req.user as { role?: string }).role === 'admin'),
  },
  fields: [
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'E.164 format, e.g. +61400000000.' },
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        description:
          "Optional — set as the team learns the customer's name. Falls back to the phone number in lists.",
      },
    },
    {
      // Read-only virtual title — used in the admin list view. Falls
      // back to phoneNumber when displayName is empty. We compute it
      // server-side via a `beforeChange` hook so the value stays in
      // sync without front-end logic.
      name: 'displayLabel',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-computed: displayName if set, otherwise phoneNumber.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Staff member responsible for replying.' },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      index: true,
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'lastMessagePreview',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'First 120 chars of the most recent message in the thread.',
      },
    },
    {
      name: 'unreadCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description:
          'Inbound messages that haven\'t been opened by any staff member. Resets to 0 when a staff member opens the conversation.',
      },
    },
    {
      name: 'firstInboundContext',
      type: 'textarea',
      admin: {
        readOnly: true,
        description:
          'Page the customer was on when they first opened the chat (captured from the TextUsWidget). Helps staff understand context.',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Staff-only notes. Never sent to the customer.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Keep displayLabel in sync without making staff edit it.
        const name =
          typeof data.displayName === 'string' && data.displayName.trim()
            ? data.displayName.trim()
            : null
        const phone =
          typeof data.phoneNumber === 'string' ? data.phoneNumber : ''
        data.displayLabel = name ?? phone
        return data
      },
    ],
  },
}
