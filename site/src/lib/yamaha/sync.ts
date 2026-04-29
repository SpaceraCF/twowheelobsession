import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

import { slugify } from '../slug'
import {
  getMotorcycleSummaries,
  getProductById,
  type YamahaDetail,
  type YamahaSummary,
} from './client'
import { seedYamahaBaseline } from './seed'

export type SyncResult = {
  fetchedSummaries: number
  created: number
  updated: number
  failed: Array<{ id: number; model?: string; error: string }>
  startedAt: string
  finishedAt: string
  durationMs: number
}

export async function syncYamahaBikes(): Promise<SyncResult> {
  const startedAt = Date.now()
  const payload = await getPayload({ config })

  const result: SyncResult = {
    fetchedSummaries: 0,
    created: 0,
    updated: 0,
    failed: [],
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: '',
    durationMs: 0,
  }

  let yamahaBrand = await findBrandIdBySlug(payload, 'yamaha')
  if (!yamahaBrand) {
    // First run after deploy — auto-seed brands + base categories.
    await seedYamahaBaseline()
    yamahaBrand = await findBrandIdBySlug(payload, 'yamaha')
    if (!yamahaBrand) {
      throw new Error('Yamaha brand still missing after seed — check the seed function.')
    }
  }

  const summaries = await getMotorcycleSummaries()
  result.fetchedSummaries = summaries.length

  for (const summary of summaries) {
    try {
      const detail = await getProductById(summary.ID)
      const categoryId = await findOrCreateCategoryFromYamaha(payload, summary)
      const data = mapYamahaToNewBike({ summary, detail, brandId: yamahaBrand, categoryId })

      const existing = await payload.find({
        collection: 'new-bikes',
        where: {
          and: [
            { externalId: { equals: String(summary.ID) } },
            { source: { equals: 'yamaha-api' } },
          ],
        },
        limit: 1,
      })

      if (existing.docs.length) {
        await payload.update({
          collection: 'new-bikes',
          id: existing.docs[0].id,
          data,
        })
        result.updated++
      } else {
        await payload.create({ collection: 'new-bikes', data })
        result.created++
      }
    } catch (err) {
      result.failed.push({
        id: summary.ID,
        model: summary.ModelName,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const finishedAt = Date.now()
  result.finishedAt = new Date(finishedAt).toISOString()
  result.durationMs = finishedAt - startedAt
  return result
}

async function findBrandIdBySlug(payload: Payload, slug: string) {
  const res = await payload.find({
    collection: 'brands',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return res.docs[0]?.id
}

const GROUP_MAP: Record<string, 'road' | 'off-road' | 'atv' | 'other'> = {
  Road: 'road',
  'Off-road': 'off-road',
  ATV: 'atv',
}

async function findOrCreateCategoryFromYamaha(payload: Payload, summary: YamahaSummary) {
  const name = summary.PrimaryCategory || summary.SubCategory || 'Other'
  const slug = slugify(name)
  const existing = await payload.find({
    collection: 'bike-categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length) return existing.docs[0].id
  const created = await payload.create({
    collection: 'bike-categories',
    data: {
      name,
      slug,
      group: GROUP_MAP[summary.ProductGroup] ?? 'other',
      displayOrder: 100,
    },
  })
  return created.id
}

function mapYamahaToNewBike(args: {
  summary: YamahaSummary
  detail: YamahaDetail
  brandId: number
  categoryId: number
}) {
  const { summary, detail, brandId, categoryId } = args
  return {
    displayName: summary.ModelName,
    slug: slugify(`yamaha-${summary.ModelName}-${summary.YearModel}`),
    tagline: summary.ItemDescription || undefined,
    brand: brandId,
    category: categoryId,
    year: summary.YearModel,
    modelCode: detail.ItemModelCode || undefined,
    baseModel: detail.Basemodel || undefined,
    primaryImage: undefined as never,
    externalImageUrl: cleanImageUrl(summary.SummaryImage),
    colors: extractColors(detail),
    specs: extractSpecs(detail.ProductSpec),
    source: 'yamaha-api' as const,
    externalId: String(summary.ID),
    rawApiData: { summary, detail } as unknown as Record<string, unknown>,
    lastSyncedAt: new Date().toISOString(),
    status: 'available' as const,
  }
}

// Yamaha returns URLs with an explicit :443 port suffix
// (https://www.yamaha-motor.com.au:443/...) which trips up next/image's
// remote pattern matcher. Strip the redundant port.
function cleanImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  return url.replace(/^(https):\/\/([^:/]+):443\//, '$1://$2/')
}

function extractColors(detail: YamahaDetail) {
  const out: Array<{ name: string }> = []
  for (let i = 1; i <= 10; i++) {
    const name = (detail as unknown as Record<string, string | null>)[`Colour${i}`]
    if (name && name.trim()) out.push({ name: name.trim() })
  }
  return out
}

function extractSpecs(s: Record<string, string | number | null>) {
  const v = (k: string) => (s[k] != null && String(s[k]).trim() ? String(s[k]) : undefined)
  return {
    engineDisplacement: v('Displacement'),
    bore: v('Bore'),
    compression: v('Compression'),
    fuelTank: v('Fuel_Tank') ?? v('FuelTank'),
    weight: v('Weight') ?? v('Wet_Weight'),
    seatHeight: v('Seat_Height') ?? v('SeatHeight'),
    transmission: v('Transmission'),
    frontBrakes: v('Brakes_Front'),
    rearBrakes: v('Brakes_Rear'),
    frontSuspension: v('Suspension_Front') ?? v('Front_Suspension'),
    rearSuspension: v('Suspension_Rear') ?? v('Rear_Suspension'),
    frontTyre: v('Tyre_Front') ?? v('Front_Tyre'),
    rearTyre: v('Tyre_Rear') ?? v('Rear_Tyre'),
  }
}
