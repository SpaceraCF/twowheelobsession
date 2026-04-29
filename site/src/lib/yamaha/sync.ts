import he from 'he'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

import { slugify } from '../slug'
import {
  getMotorcycleSummaries,
  getProductById,
  getProductColors,
  type YamahaColor,
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
      const colors = await getProductColors(summary.ID).catch(() => [] as YamahaColor[])
      const categoryId = await findOrCreateCategoryFromYamaha(payload, summary)
      const data = mapYamahaToNewBike({ summary, detail, colors, brandId: yamahaBrand, categoryId })

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
  colors: YamahaColor[]
  brandId: number
  categoryId: number
}) {
  const { summary, detail, colors, brandId, categoryId } = args
  // RecommendedRetail (AUD) is the dealer-facing RRP. 0 means "no price set"
  // for that bike — leave undefined so the frontend renders "Price on request".
  const price =
    typeof detail.RecommendedRetail === 'number' && detail.RecommendedRetail > 0
      ? detail.RecommendedRetail
      : undefined
  // Map Yamaha's bike-level Status to our listing status.
  const yamahaStatus = (detail.Status ?? '').toUpperCase()
  const status =
    yamahaStatus === 'DISCONTINUED' ? ('discontinued' as const) : ('available' as const)

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
    colors: extractColors(detail, colors),
    descriptionText: cleanLongDescription(detail.LongDescription),
    specs: extractSpecs(detail.ProductSpec),
    price,
    priceLabel: price ? 'Ride away' : undefined,
    source: 'yamaha-api' as const,
    externalId: String(summary.ID),
    rawApiData: { summary, detail } as unknown as Record<string, unknown>,
    lastSyncedAt: new Date().toISOString(),
    status,
  }
}

// Yamaha returns URLs with an explicit :443 port suffix
// (https://www.yamaha-motor.com.au:443/...) which trips up next/image's
// remote pattern matcher. Strip the redundant port.
function cleanImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  return url.replace(/^(https):\/\/([^:/]+):443\//, '$1://$2/')
}

function extractColors(detail: YamahaDetail, colors: YamahaColor[]) {
  type ColorMeta = { hex?: string; imageUrl?: string }
  const byName = new Map<string, ColorMeta>()
  for (const c of colors) {
    if (c.Active === false) continue
    const name = c.ColorName?.trim()
    if (!name) continue
    byName.set(name.toLowerCase(), {
      hex: c.ColorCode?.trim() || undefined,
      imageUrl: cleanImageUrl(c.ColorImage),
    })
  }

  const out: Array<{ name: string; hex?: string; imageUrl?: string }> = []
  const seen = new Set<string>()
  for (let i = 1; i <= 10; i++) {
    const raw = (detail as unknown as Record<string, string | null>)[`Colour${i}`]
    const name = raw?.trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const meta = byName.get(key)
    out.push({ name, hex: meta?.hex, imageUrl: meta?.imageUrl })
  }

  // Include any colours from the colours endpoint that weren't in the detail list.
  for (const c of colors) {
    if (c.Active === false) continue
    const name = c.ColorName?.trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      name,
      hex: c.ColorCode?.trim() || undefined,
      imageUrl: cleanImageUrl(c.ColorImage),
    })
  }

  return out
}

function extractSpecs(s: Record<string, string | number | null>) {
  const v = (...keys: string[]) => {
    for (const k of keys) {
      if (s[k] != null && String(s[k]).trim()) return String(s[k])
    }
    return undefined
  }
  return {
    // Engine
    engineType: v('Engine'),
    engineDisplacement: v('Displacement'),
    bore: v('Bore'),
    compression: v('Compression'),
    lubrication: v('Lubrication'),
    fuelSystem: v('Fuel'),
    ignition: v('Ignition'),
    starter: v('Starter'),
    fuelTank: v('Fuel_Tank', 'FuelTank'),
    oilCapacity: v('Oil', 'Oil_Capacity'),
    finalDrive: v('Final_Trans', 'Final_Drive'),
    transmission: v('Transmission'),
    // Chassis
    frame: v('Frame'),
    frontSuspension: v('Suspension_Front', 'Front_Suspension'),
    rearSuspension: v('Suspension_Rear', 'Rear_Suspension'),
    frontBrakes: v('Brakes_Front'),
    rearBrakes: v('Brakes_Rear'),
    frontTyre: v('Tyres_Front', 'Tyre_Front', 'Front_Tyre'),
    rearTyre: v('Tyres_Rear', 'Tyre_Rear', 'Rear_Tyre'),
    // Dimensions
    length: v('Length'),
    width: v('Width'),
    height: v('Height'),
    seatHeight: v('Seat_Height', 'SeatHeight'),
    wheelbase: v('Wheelbase'),
    clearance: v('Clearance', 'Ground_Clearance'),
    weight: v('Weight', 'Wet_Weight'),
  }
}

function cleanLongDescription(html: string | null | undefined): string | undefined {
  if (!html) return undefined
  // Yamaha LongDescription is HTML: <br>/<p> for breaks, plus named
  // entities like &rsquo;, &mdash;, &eacute;. Strip tags, decode the
  // full HTML5 entity set via `he`, normalise whitespace.
  const text = he
    .decode(
      html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?p[^>]*>/gi, '\n\n')
        .replace(/<[^>]+>/g, ''),
    )
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text || undefined
}
