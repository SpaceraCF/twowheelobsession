import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  // Public read so hero images, brand logos, and used-bike photos
  // load on the customer-facing site. Server-side Payload calls
  // (e.g. getPayload(...).find from a server component) bypass
  // access checks anyway; this rule applies to the
  // /api/media/file/* endpoint that the BROWSER hits when
  // <Image> resolves a Media URL. Without it, Payload returns
  // 401 "You are not allowed to perform this action" and every
  // hero / logo / photo renders as a broken image.
  //
  // Create / update / delete remain default (logged-in user) so
  // the public can't upload via the REST API.
  access: {
    read: () => true,
  },
  upload: {
    // In production on Render this is /var/data/media (a persistent disk).
    // Locally it's just ./media in the project, gitignored.
    staticDir: process.env.PAYLOAD_MEDIA_DIR || 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'syndication', width: 1024, height: 768, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
  ],
}
