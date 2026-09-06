import type { CollectionConfig } from 'payload'

// Workshop news / blog.
//
// The brief from TWO is a weekly post about what came through the
// workshop. Five busy people at a bike shop will not write essays, so
// the schema is deliberately shallow: a title, one photo, a few
// paragraphs, and the bike it was about. Everything else is optional.
//
// The SEO value here is long-tail — "yamaha mt-07 15000km service
// central coast" is a query nobody is bidding on and a real workshop
// write-up can win. That only works if posts actually get published
// week after week, which is why the required-field list is this short.

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'postType', 'publishedAt', '_status'],
    description:
      'Workshop write-ups, dealership news and buying guides. Published posts appear at /news and in the Latest News block on the homepage.',
    group: 'Content',
  },
  access: {
    // Anonymous visitors only ever see published posts. Any logged-in
    // staff member sees drafts too so they can preview their own work.
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  versions: { drafts: true },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        // Derive the slug from the title, but never overwrite one that
        // has been set — changing a slug breaks any link already shared.
        if (!data.slug && typeof data.title === 'string') {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-filled from the title. Leave it alone once the post is live.',
      },
    },
    {
      name: 'postType',
      type: 'select',
      defaultValue: 'workshop',
      options: [
        { label: 'Workshop log', value: 'workshop' },
        { label: 'Dealership news', value: 'news' },
        { label: 'Buying / owner guide', value: 'guide' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
        description: 'Controls ordering on /news.',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Who wrote it — e.g. "Nikkie" or "The workshop".',
      },
    },

    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description:
          'One or two sentences. Shows on the news index, the homepage cards, and in Google results.',
      },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true },

    {
      type: 'collapsible',
      label: 'Bike this was about',
      admin: {
        initCollapsed: true,
        description:
          'Optional. Filling this in lets the post cross-link to the model page, which is where most of the SEO value is.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'bikeMake', type: 'text', admin: { width: '34%' } },
            { name: 'bikeModel', type: 'text', admin: { width: '33%' } },
            { name: 'bikeYear', type: 'number', admin: { width: '33%' } },
          ],
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'SEO overrides',
      admin: {
        initCollapsed: true,
        description: 'Leave blank to use the title and excerpt above.',
      },
      fields: [
        { name: 'seoTitle', type: 'text', maxLength: 70 },
        { name: 'seoDescription', type: 'textarea', maxLength: 170 },
      ],
    },
  ],
}
