import type { CollectionConfig } from 'payload'

export const UsedBikes: CollectionConfig = {
  slug: 'used-bikes',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['stockNumber', 'displayName', 'year', 'kms', 'price', 'listingStatus', 'updatedAt'],
    group: 'Bikes',
  },
  versions: { drafts: { autosave: { interval: 800 } } },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Listing',
          fields: [
            { name: 'stockNumber', type: 'text', required: true, unique: true, index: true, admin: { description: 'Internal dealer stock number.' } },
            { name: 'displayName', type: 'text', required: true, admin: { description: 'Customer-facing title, e.g. "2021 Yamaha MT-09 SP".' } },
            { name: 'slug', type: 'text', required: true, unique: true, index: true },
            { name: 'tagline', type: 'text', admin: { description: 'One-liner that runs above the description.' } },
            { name: 'description', type: 'richText', required: true, admin: { description: 'Marketing copy. Will be syndicated to bikesales.com.au.' } },
            { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
            {
              name: 'photos',
              type: 'array',
              minRows: 1,
              labels: { singular: 'Photo', plural: 'Photos' },
              admin: { description: 'First photo is the cover. bikesales accepts up to 24 photos at 1024x768+.' },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Classification',
          description: 'Required by the bikesales.com.au dealer feed.',
          fields: [
            { name: 'year', type: 'number', required: true, min: 1950, max: 2030 },
            { name: 'brand', type: 'relationship', relationTo: 'brands', required: true },
            { name: 'model', type: 'text', required: true, admin: { description: 'Base model, e.g. "MT-09".' } },
            { name: 'variant', type: 'text', admin: { description: 'Variant / trim, e.g. "SP".' } },
            { name: 'category', type: 'relationship', relationTo: 'bike-categories' },
            {
              name: 'bodyType',
              type: 'select',
              required: true,
              options: [
                { label: 'Road / Sport', value: 'sport' },
                { label: 'Naked', value: 'naked' },
                { label: 'Cruiser', value: 'cruiser' },
                { label: 'Sport Touring', value: 'sport-touring' },
                { label: 'Touring', value: 'touring' },
                { label: 'Adventure', value: 'adventure' },
                { label: 'Scooter', value: 'scooter' },
                { label: 'Enduro', value: 'enduro' },
                { label: 'Motocross', value: 'motocross' },
                { label: 'Trail / Dual Sport', value: 'dual-sport' },
                { label: 'ATV / Quad', value: 'atv' },
                { label: 'Other', value: 'other' },
              ],
            },
          ],
        },
        {
          label: 'Engine & drivetrain',
          fields: [
            { name: 'engineCc', type: 'number', label: 'Engine displacement (cc)' },
            { name: 'cylinders', type: 'number' },
            {
              name: 'transmission',
              type: 'select',
              options: [
                { label: 'Manual', value: 'manual' },
                { label: 'Automatic', value: 'automatic' },
                { label: 'Semi-automatic', value: 'semi-auto' },
                { label: 'CVT', value: 'cvt' },
              ],
            },
          ],
        },
        {
          label: 'Condition & history',
          fields: [
            { name: 'kms', type: 'number', required: true, label: 'Kilometres' },
            {
              name: 'condition',
              type: 'select',
              required: true,
              defaultValue: 'used',
              options: [
                { label: 'Used', value: 'used' },
                { label: 'Demo', value: 'demo' },
              ],
            },
            { name: 'color', type: 'text', label: 'Colour' },
            { name: 'vin', type: 'text', label: 'VIN / frame number', admin: { description: 'Internal — not published.' } },
            { name: 'engineNumber', type: 'text', admin: { description: 'Internal — not published.' } },
            {
              name: 'registrationStatus',
              type: 'select',
              options: [
                { label: 'Registered', value: 'registered' },
                { label: 'Unregistered', value: 'unregistered' },
              ],
            },
            {
              name: 'registrationState',
              type: 'select',
              admin: { condition: (data) => data?.registrationStatus === 'registered' },
              options: [
                { label: 'NSW', value: 'NSW' }, { label: 'VIC', value: 'VIC' }, { label: 'QLD', value: 'QLD' },
                { label: 'WA', value: 'WA' }, { label: 'SA', value: 'SA' }, { label: 'TAS', value: 'TAS' },
                { label: 'ACT', value: 'ACT' }, { label: 'NT', value: 'NT' },
              ],
            },
            { name: 'registrationExpiryDate', type: 'date', admin: { condition: (data) => data?.registrationStatus === 'registered' } },
            { name: 'complianceDate', type: 'date' },
            { name: 'buildDate', type: 'date' },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            { name: 'price', type: 'number', required: true, label: 'Price (AUD)' },
            { name: 'priceLabel', type: 'text', defaultValue: 'Drive away', admin: { description: 'e.g. "Drive away" or "Plus on-road costs".' } },
          ],
        },
        {
          label: 'Status & syndication',
          fields: [
            {
              name: 'listingStatus',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              admin: { description: 'Customer-facing listing state. Separate from draft/published versioning.' },
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Available', value: 'available' },
                { label: 'On hold', value: 'on-hold' },
                { label: 'Sold', value: 'sold' },
                { label: 'Archived', value: 'archived' },
              ],
            },
            {
              name: 'soldDate',
              type: 'date',
              admin: { condition: (data) => data?.listingStatus === 'sold' },
            },
            {
              name: 'syndication',
              type: 'group',
              label: 'External syndication',
              fields: [
                {
                  name: 'bikesales',
                  type: 'group',
                  label: 'bikesales.com.au',
                  fields: [
                    { name: 'enabled', type: 'checkbox', defaultValue: true, admin: { description: 'Include this bike in the bikesales feed.' } },
                    { name: 'externalId', type: 'text', admin: { description: 'bikesales internal listing ID once syndicated.' } },
                    { name: 'lastFeedAt', type: 'date', admin: { readOnly: true } },
                    { name: 'lastError', type: 'textarea', admin: { readOnly: true } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
