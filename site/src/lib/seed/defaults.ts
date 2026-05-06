/**
 * Idempotent seed for the bootstrap content the team would otherwise
 * have to upload manually on first install:
 *
 * - Brand logos (Yamaha / Suzuki / CFMOTO) — already shipped under
 *   /public/brand/* but never imported into the Media collection.
 *   Without this, the Brands list shows blank logo cells in the admin.
 * - Homepage hero slides — the four images under /public/hero/* that
 *   served as the fallback in `components/Hero.tsx`. Once these exist
 *   in HeroSlides the fallback never triggers.
 *
 * Re-run any time without duplicating: each step checks if the target
 * record already exists (by filename for Media, by slug for Brands,
 * by title for HeroSlides) and skips if so.
 */

import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

type Outcome = {
  brandLogos: { brand: string; status: 'set' | 'already-set' | 'brand-not-found' | 'media-found' | 'media-uploaded' }[]
  heroSlides: { title: string; status: 'created' | 'already-exists' | 'media-uploaded' | 'media-found' }[]
}

// Content seeds — kept inline so the seed is self-contained. Update
// here when the dealer ships new artwork.
const BRAND_LOGOS: Array<{
  brandSlug: string
  filename: string
  alt: string
}> = [
  { brandSlug: 'yamaha', filename: 'yamaha.png', alt: 'Yamaha — Revs Your Heart' },
  { brandSlug: 'suzuki', filename: 'suzuki.jpg', alt: 'Suzuki' },
  { brandSlug: 'cfmoto', filename: 'cfmoto.jpg', alt: 'CFMOTO' },
]

const HERO_SLIDES: Array<{
  title: string
  filename: string
  alt: string
  linkUrl: string
  order: number
}> = [
  {
    title: 'MT Dark Side',
    filename: 'mt-darkside.jpg',
    alt: 'Save on the Dark Side — MT-10 SP and more',
    linkUrl: '/new-bikes?brand=yamaha',
    order: 10,
  },
  {
    title: 'Yamaha EOFY Sale',
    filename: 'eofy.jpg',
    alt: 'Yamaha EOFY Sale — finance and savings, offers end June 30 2026',
    linkUrl: '/new-bikes?brand=yamaha',
    order: 20,
  },
  {
    title: 'Easter Fun Bike Finance',
    filename: 'easter-funbike.jpg',
    alt: '0% finance on all new Fun Bikes — 24 month term, no deposit',
    linkUrl: '/new-bikes?category=fun-bike',
    order: 30,
  },
  {
    title: 'Road Bike Finance',
    filename: 'road-bike-finance.jpg',
    alt: '2.99% finance on selected MY26 road bikes — Plus save on YZF-R3SP',
    linkUrl: '/new-bikes?brand=yamaha',
    order: 40,
  },
]

// Resolves a /public path to an absolute filesystem path so Payload's
// upload `filePath` option can read it. Works in both dev and the
// Render production build (the public/ folder ships as static assets,
// but Next also leaves them on disk under .next/standalone/public).
function publicAssetPath(relative: string): string {
  return path.resolve(process.cwd(), 'public', relative)
}

export async function seedDefaults(): Promise<Outcome> {
  const payload = await getPayload({ config })
  const outcome: Outcome = { brandLogos: [], heroSlides: [] }

  // ---------- Brand logos ----------
  for (const entry of BRAND_LOGOS) {
    // 1. Find the brand
    const brandResult = await payload.find({
      collection: 'brands',
      where: { slug: { equals: entry.brandSlug } },
      limit: 1,
      depth: 0,
    })
    const brand = brandResult.docs[0]
    if (!brand) {
      outcome.brandLogos.push({ brand: entry.brandSlug, status: 'brand-not-found' })
      continue
    }
    if (brand.logo) {
      outcome.brandLogos.push({ brand: entry.brandSlug, status: 'already-set' })
      continue
    }

    // 2. Find or upload the Media doc
    const mediaId = await ensureMediaByFilename({
      payload,
      filename: entry.filename,
      filePath: publicAssetPath(`brand/${entry.filename}`),
      alt: entry.alt,
    })

    // 3. Wire to brand
    await payload.update({
      collection: 'brands',
      id: brand.id,
      data: { logo: mediaId } as never,
    })
    outcome.brandLogos.push({ brand: entry.brandSlug, status: 'set' })
  }

  // ---------- Hero slides ----------
  for (const entry of HERO_SLIDES) {
    // Check if a HeroSlide with this title already exists.
    const existing = await payload.find({
      collection: 'hero-slides',
      where: { title: { equals: entry.title } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      outcome.heroSlides.push({ title: entry.title, status: 'already-exists' })
      continue
    }

    const mediaId = await ensureMediaByFilename({
      payload,
      filename: entry.filename,
      filePath: publicAssetPath(`hero/${entry.filename}`),
      alt: entry.alt,
    })

    await payload.create({
      collection: 'hero-slides',
      data: {
        title: entry.title,
        image: mediaId,
        linkUrl: entry.linkUrl,
        order: entry.order,
        active: true,
      } as never,
    })
    outcome.heroSlides.push({ title: entry.title, status: 'created' })
  }

  return outcome
}

// Returns the id of an existing Media doc with this filename, or
// uploads it from `filePath` and returns the new id.
async function ensureMediaByFilename({
  payload,
  filename,
  filePath,
  alt,
}: {
  // payload type is `Awaited<ReturnType<typeof getPayload>>` but we
  // keep it loose to avoid a long generic chain just for one helper.
  payload: Awaited<ReturnType<typeof getPayload>>
  filename: string
  filePath: string
  alt: string
}): Promise<number | string> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    return existing.docs[0].id
  }
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
  })
  return created.id
}
