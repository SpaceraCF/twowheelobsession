import type { CollectionConfig } from 'payload'

import { buildOrderEmail } from '../lib/notifications/build.ts'

// Yamaha Parts Australia checkout orders. Customers pay via PayPal at
// the parts site (yamahapartsaustralia.com.au) and the order lands here
// for staff to fulfil manually via Evopos. Bikes never go through this
// flow — they route to a finance enquiry instead.
//
// On `create` (always server-side, never via the admin), we fire an
// email to PARTS_ORDER_NOTIFY_EMAIL with the line items + customer +
// PayPal capture id. The admin UI is read-mostly: staff pick / pack /
// ship and update `status` as they go.
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'customerName', 'total', 'createdAt'],
    group: 'Orders',
    description:
      'Parts orders from yamahapartsaustralia.com.au. Customers paid via PayPal — fulfil via Evopos and update status as you go.',
  },
  access: {
    // Server-side only via `payload.create` from the checkout capture
    // endpoint. Never accept anonymous public creates.
    create: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const to = process.env.PARTS_ORDER_NOTIFY_EMAIL
        if (!to || !req.payload.email) return
        try {
          const { subject, text } = buildOrderEmail(doc as Record<string, unknown>)
          await req.payload.sendEmail({ to, subject, text })
        } catch (err) {
          req.payload.logger.error(
            { err },
            '[Orders] notification email failed (order still saved)',
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Generated server-side at checkout (e.g. YPA-12345).' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'paid',
      options: [
        { label: 'Paid (new)', value: 'paid' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Picked up', value: 'picked-up' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'shippingMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'AU flat rate (A$12)', value: 'au-flat' },
        { label: 'In-store pickup (West Gosford)', value: 'pickup' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Customer',
      admin: { initCollapsed: false },
      fields: [
        { name: 'customerName', type: 'text', required: true },
        { name: 'customerEmail', type: 'email', required: true },
        { name: 'customerPhone', type: 'text', required: true },
      ],
    },
    {
      type: 'collapsible',
      label: 'Shipping address',
      admin: {
        initCollapsed: false,
        description: 'Empty for in-store pickup.',
      },
      fields: [
        { name: 'addressLine1', type: 'text' },
        { name: 'addressLine2', type: 'text' },
        { name: 'suburb', type: 'text' },
        {
          name: 'state',
          type: 'select',
          options: [
            { label: 'NSW', value: 'NSW' },
            { label: 'VIC', value: 'VIC' },
            { label: 'QLD', value: 'QLD' },
            { label: 'WA', value: 'WA' },
            { label: 'SA', value: 'SA' },
            { label: 'TAS', value: 'TAS' },
            { label: 'ACT', value: 'ACT' },
            { label: 'NT', value: 'NT' },
          ],
        },
        { name: 'postcode', type: 'text' },
      ],
    },
    {
      name: 'lineItems',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Line item', plural: 'Line items' },
      fields: [
        { name: 'sku', type: 'text', required: true, admin: { description: 'EPC part number / Yamaha SKU.' } },
        { name: 'name', type: 'text', required: true },
        { name: 'qty', type: 'number', required: true, min: 1 },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          admin: { description: 'AUD, GST-inclusive (Yamaha RRP from EPC).' },
        },
        { name: 'lineTotal', type: 'number', required: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', required: true, admin: { width: '33%', description: 'AUD' } },
        { name: 'shipping', type: 'number', required: true, admin: { width: '33%', description: 'AUD' } },
        { name: 'total', type: 'number', required: true, admin: { width: '33%', description: 'AUD' } },
      ],
    },
    {
      type: 'collapsible',
      label: 'PayPal',
      admin: { initCollapsed: true },
      fields: [
        { name: 'paypalEnv', type: 'text', admin: { description: 'sandbox or live at time of order.' } },
        { name: 'paypalOrderId', type: 'text', index: true },
        { name: 'paypalCaptureId', type: 'text', index: true },
        { name: 'paypalCaptureStatus', type: 'text' },
        { name: 'paypalPayerEmail', type: 'email' },
      ],
    },
    {
      name: 'fulfilmentNotes',
      type: 'textarea',
      admin: { description: 'Internal — never shown to the customer. Tracking, packed-by, etc.' },
    },
  ],
}
