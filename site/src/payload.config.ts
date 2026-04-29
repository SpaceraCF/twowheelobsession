import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { BikeCategories } from './collections/BikeCategories.ts'
import { Brands } from './collections/Brands.ts'
import { Enquiries } from './collections/Enquiries.ts'
import { Media } from './collections/Media.ts'
import { NewBikes } from './collections/NewBikes.ts'
import { Pages } from './collections/Pages.ts'
import { ServiceRequests } from './collections/ServiceRequests.ts'
import { UsedBikes } from './collections/UsedBikes.ts'
import { Users } from './collections/Users.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— Two Wheel Obsession Admin',
    },
  },
  collections: [
    Users,
    Media,
    Brands,
    BikeCategories,
    NewBikes,
    UsedBikes,
    Enquiries,
    ServiceRequests,
    Pages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Auto-push schema diffs at boot — including in production. Suitable for
    // small-team v1 where there's no separate ops review of migrations. Switch
    // to file-based migrations (`npm run migrate:create` / `npm run migrate`)
    // before any destructive schema change goes through prod.
    push: true,
  }),
  sharp,
})
