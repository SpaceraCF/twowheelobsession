import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import nodemailer from 'nodemailer'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { migrations } from './migrations/index.ts'
import { BikeCategories } from './collections/BikeCategories.ts'
import { Brands } from './collections/Brands.ts'
import { Enquiries } from './collections/Enquiries.ts'
import { HeroSlides } from './collections/HeroSlides.ts'
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
    HeroSlides,
  ],
  editor: lexicalEditor(),
  // Email: SendGrid via nodemailer SMTP relay if SENDGRID_API_KEY is set,
  // otherwise Payload writes to console (default). The SendGrid SMTP
  // username is the literal string "apikey"; the password is the API key.
  // EMAIL_FROM_ADDRESS must be a verified Single Sender or on a verified
  // domain in SendGrid.
  email: process.env.SENDGRID_API_KEY
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'enquiries@twowheelobsession.com.au',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Two Wheel Obsession',
        transport: nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        }),
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Dev: schema diffs auto-pushed (Drizzle's "push" mode, default in non-prod).
    // Prod: migrations from src/migrations/ run automatically at boot.
    //
    // To add a new migration after schema changes:
    //   npm run migrate:create <name>
    // Then commit the generated files in src/migrations/.
    prodMigrations: migrations,
  }),
  sharp,
})
