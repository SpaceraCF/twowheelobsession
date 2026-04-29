import type { CollectionConfig } from 'payload'

export const NewBikes: CollectionConfig = {
  slug: 'new-bikes',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'brand', 'category', 'year', 'price', 'status', 'source'],
    group: 'Bikes',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Display',
          fields: [
            { name: 'displayName', type: 'text', required: true, admin: { description: 'e.g. "XSR900 GP"' } },
            { name: 'slug', type: 'text', required: true, unique: true, index: true },
            { name: 'tagline', type: 'text', admin: { description: 'Short marketing line, e.g. "Born Iconic"' } },
            { name: 'description', type: 'richText' },
            { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
          ],
        },
        {
          label: 'Classification',
          fields: [
            { name: 'brand', type: 'relationship', relationTo: 'brands', required: true },
            { name: 'category', type: 'relationship', relationTo: 'bike-categories' },
            { name: 'year', type: 'number' },
            { name: 'modelCode', type: 'text', admin: { description: 'Manufacturer model code (e.g. MTM890ASPT)' } },
            { name: 'baseModel', type: 'text', admin: { description: 'Base model name without variant (e.g. XSR900)' } },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            { name: 'price', type: 'number', admin: { description: 'Recommended retail price (AUD, ex on-roads unless priceLabel says otherwise)' } },
            { name: 'priceLabel', type: 'text', admin: { description: 'e.g. "Ride away" or "From"' } },
          ],
        },
        {
          label: 'Media',
          fields: [
            { name: 'primaryImage', type: 'upload', relationTo: 'media' },
            {
              name: 'externalImageUrl',
              type: 'text',
              admin: { description: 'External image URL (e.g. from Yamaha API). Used until image is downloaded into Media.' },
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
            {
              name: 'colors',
              type: 'array',
              admin: { description: 'Available colours / colourways for this model.' },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'hex', type: 'text', admin: { description: 'CSS hex code, e.g. #FFCC00' } },
                { name: 'image', type: 'upload', relationTo: 'media' },
                {
                  name: 'imageUrl',
                  type: 'text',
                  admin: { description: 'External per-colour image URL (e.g. from Yamaha API). Used until image is downloaded into Media.' },
                },
              ],
            },
            { name: 'brochureUrl', type: 'text' },
          ],
        },
        {
          label: 'Specs',
          fields: [
            {
              name: 'specs',
              type: 'group',
              fields: [
                { name: 'engineDisplacement', type: 'text' },
                { name: 'engineType', type: 'text' },
                { name: 'bore', type: 'text' },
                { name: 'compression', type: 'text' },
                { name: 'fuelTank', type: 'text' },
                { name: 'weight', type: 'text' },
                { name: 'seatHeight', type: 'text' },
                { name: 'transmission', type: 'text' },
                { name: 'frontBrakes', type: 'text' },
                { name: 'rearBrakes', type: 'text' },
                { name: 'frontSuspension', type: 'text' },
                { name: 'rearSuspension', type: 'text' },
                { name: 'frontTyre', type: 'text' },
                { name: 'rearTyre', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Sync',
          fields: [
            {
              name: 'source',
              type: 'select',
              required: true,
              defaultValue: 'manual',
              options: [
                { label: 'Yamaha API sync', value: 'yamaha-api' },
                { label: 'Manual entry', value: 'manual' },
              ],
            },
            {
              name: 'externalId',
              type: 'text',
              index: true,
              admin: { description: 'External provider ID (e.g. Yamaha API ID). Required for sync.' },
            },
            {
              name: 'lastSyncedAt',
              type: 'date',
              admin: { readOnly: true, description: 'Last successful sync from external API.' },
            },
            {
              name: 'rawApiData',
              type: 'json',
              admin: { description: 'Raw payload from last sync. Used for re-sync and debugging.' },
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Pre-order', value: 'pre-order' },
        { label: 'Discontinued', value: 'discontinued' },
        { label: 'Hidden', value: 'hidden' },
      ],
    },
  ],
}
