import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

import { slugify } from '../slug'

// Categories observed on the live twowheelobsession.com.au homepage.
// Sync may add others on-the-fly if Yamaha returns categories not listed here.
const ROAD_CATEGORIES = [
  'Supersport',
  'Maximum Torque',
  'Sport Heritage',
  'Sport Touring',
  'Scooter',
  'Naked',
]

const OFF_ROAD_CATEGORIES = [
  'Motocross',
  'Enduro',
  'Fun Bike',
  'Adventure',
  'Agriculture',
  'Trail',
]

const ATV_CATEGORIES = ['Fun ATV', 'Sport ATV', 'Utility ATV']

export type SeedResult = {
  brandsCreated: number
  brandsExisting: number
  categoriesCreated: number
  categoriesExisting: number
}

async function findOrCreateBrand(payload: Payload, name: string) {
  const slug = slugify(name)
  const existing = await payload.find({
    collection: 'brands',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length) return { doc: existing.docs[0], created: false }
  const doc = await payload.create({
    collection: 'brands',
    data: { name, slug, displayOrder: 100, isActive: true },
  })
  return { doc, created: true }
}

async function findOrCreateCategory(
  payload: Payload,
  name: string,
  group: 'road' | 'off-road' | 'atv' | 'other',
) {
  const slug = slugify(name)
  const existing = await payload.find({
    collection: 'bike-categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length) return { doc: existing.docs[0], created: false }
  const doc = await payload.create({
    collection: 'bike-categories',
    data: { name, slug, group, displayOrder: 100 },
  })
  return { doc, created: true }
}

export async function seedYamahaBaseline(): Promise<SeedResult> {
  const payload = await getPayload({ config })
  const result: SeedResult = {
    brandsCreated: 0,
    brandsExisting: 0,
    categoriesCreated: 0,
    categoriesExisting: 0,
  }

  for (const name of ['Yamaha', 'Suzuki', 'CFMOTO']) {
    const { created } = await findOrCreateBrand(payload, name)
    if (created) result.brandsCreated++
    else result.brandsExisting++
  }

  const categoryGroups: Array<[string[], 'road' | 'off-road' | 'atv']> = [
    [ROAD_CATEGORIES, 'road'],
    [OFF_ROAD_CATEGORIES, 'off-road'],
    [ATV_CATEGORIES, 'atv'],
  ]

  for (const [names, group] of categoryGroups) {
    for (const name of names) {
      const { created } = await findOrCreateCategory(payload, name, group)
      if (created) result.categoriesCreated++
      else result.categoriesExisting++
    }
  }

  return result
}
