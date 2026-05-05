import type { CollectionConfig } from 'payload'

// Hero carousel slides — staff-managed via Payload admin so swapping
// Yamaha campaign artwork doesn't need a code deploy. Replaces the
// old WP "Slider Revolution" UI from the Lusion theme.
//
// The frontend reads the `active` slides, filters by date window if
// set, and sorts by `order` asc. See `src/components/Hero.tsx`.
export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'active', 'startDate', 'endDate', 'updatedAt'],
    group: 'Site content',
    description:
      'Homepage hero banners. Lower Order numbers appear first. Toggle Active off to hide a slide without deleting it.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal label only — not shown to customers. e.g. "EOFY 2026 sale".',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description:
          'Wide hero image, ideally 1920×600 or larger. The Media item\'s alt text becomes the slide\'s alt — set it well for accessibility and SEO.',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      admin: {
        description:
          'Where the slide links when clicked. Leave blank to make the slide non-clickable. Internal links: /new-bikes?brand=yamaha. External: full https URL.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: {
        description: 'Lower numbers appear first. Default 100.',
        step: 10,
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide without deleting.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Optional. Slide hidden before this date.',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Optional. Slide hidden after this date.',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
  ],
}
