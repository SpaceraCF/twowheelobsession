import { getPayload, type Payload } from "payload"
import config from "@payload-config"

import { slugify } from "./slug"

type SeedBike = {
  stockNumber: string
  displayName: string
  brand: "yamaha" | "suzuki" | "cfmoto"
  model: string
  variant?: string
  year: number
  kms: number
  bodyType:
    | "sport"
    | "naked"
    | "cruiser"
    | "sport-touring"
    | "touring"
    | "adventure"
    | "scooter"
    | "enduro"
    | "motocross"
    | "dual-sport"
    | "atv"
    | "other"
  engineCc?: number
  transmission?: "manual" | "automatic" | "semi-auto" | "cvt"
  color?: string
  registrationStatus?: "registered" | "unregistered"
  registrationState?: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT"
  price: number
  priceLabel?: string
  tagline?: string
  description: string
  features?: string[]
}

const SAMPLES: SeedBike[] = [
  {
    stockNumber: "TWO-2401",
    displayName: "2021 Yamaha MT-09 SP",
    brand: "yamaha",
    model: "MT-09",
    variant: "SP",
    year: 2021,
    kms: 8900,
    bodyType: "naked",
    engineCc: 890,
    transmission: "manual",
    color: "Silver Blu Carbon",
    registrationStatus: "registered",
    registrationState: "NSW",
    price: 16990,
    priceLabel: "Drive away",
    tagline: "One owner, full Yamaha service history.",
    description:
      "Pristine MT-09 SP with the upgraded Öhlins shock and KYB front-end. One careful owner, all books, two keys, and just back from a major service.",
    features: ["Quickshifter (up & down)", "Öhlins rear shock", "KYB inverted forks", "Cruise control"],
  },
  {
    stockNumber: "TWO-2402",
    displayName: "2022 Yamaha YZF-R7",
    brand: "yamaha",
    model: "YZF-R7",
    year: 2022,
    kms: 4200,
    bodyType: "sport",
    engineCc: 689,
    transmission: "manual",
    color: "Yamaha Blue",
    registrationStatus: "registered",
    registrationState: "NSW",
    price: 13990,
    priceLabel: "Drive away",
    description:
      "Track-day weapon, road registered. Has been meticulously cared for. Includes Yamaha tail tidy and rear sets.",
    features: ["LAMS-eligible (with restrictor)", "Yamaha tail tidy", "Slip-on exhaust"],
  },
  {
    stockNumber: "TWO-2403",
    displayName: "2020 Yamaha Tenere 700",
    brand: "yamaha",
    model: "Tenere 700",
    year: 2020,
    kms: 22500,
    bodyType: "adventure",
    engineCc: 689,
    transmission: "manual",
    color: "Ceramic Ice",
    registrationStatus: "registered",
    registrationState: "NSW",
    price: 14990,
    priceLabel: "Drive away",
    tagline: "Adventure-ready with bash plate, panniers and crash bars.",
    description:
      "Genuine adventure bike, ready to ride away with all the gear you need. Recent Bridgestone TW101/TW152 tyres, Andreani fork cartridges fitted.",
    features: ["Givi side panniers + top box", "Engine bash plate", "Crash bars", "USB power"],
  },
  {
    stockNumber: "TWO-2404",
    displayName: "2019 Suzuki GSX-R1000",
    brand: "suzuki",
    model: "GSX-R1000",
    year: 2019,
    kms: 14800,
    bodyType: "sport",
    engineCc: 999,
    transmission: "manual",
    color: "Pearl Mira Red / Glass Sparkle Black",
    registrationStatus: "registered",
    registrationState: "NSW",
    price: 18990,
    priceLabel: "Drive away",
    description:
      "Iconic Gixxer thou, beautifully maintained. Includes Yoshimura Alpha 2 slip-on and frame sliders.",
    features: ["Yoshimura Alpha 2 slip-on", "Frame sliders", "Tail tidy"],
  },
  {
    stockNumber: "TWO-2405",
    displayName: "2023 CFMOTO 800MT Sport",
    brand: "cfmoto",
    model: "800MT",
    variant: "Sport",
    year: 2023,
    kms: 6700,
    bodyType: "adventure",
    engineCc: 799,
    transmission: "manual",
    color: "Atlas Grey",
    registrationStatus: "registered",
    registrationState: "NSW",
    price: 12490,
    priceLabel: "Drive away",
    tagline: "Brembo brakes, KYB suspension, full TFT dash — incredible value.",
    description:
      "Demo unit just rotated out of the fleet. Full warranty applies. Brembo brakes and KYB suspension make this a genuine adventure machine for the money.",
    features: ["Brembo brakes", "KYB suspension", "Full-colour TFT dash", "Ride-by-wire throttle"],
  },
  {
    stockNumber: "TWO-2406",
    displayName: "2018 Yamaha XSR700",
    brand: "yamaha",
    model: "XSR700",
    year: 2018,
    kms: 31200,
    bodyType: "naked",
    engineCc: 689,
    transmission: "manual",
    color: "Garage Metal",
    registrationStatus: "registered",
    registrationState: "NSW",
    price: 8990,
    priceLabel: "Drive away",
    tagline: "Modern classic at the right price.",
    description:
      "Lots of fun for the money. CP2 motor is bulletproof. Akrapovic exhaust gives it some real character.",
    features: ["LAMS-approved", "Akrapovic exhaust", "Bar-end mirrors"],
  },
]

export type UsedSeedResult = {
  created: number
  existing: number
  skipped: number
}

export async function seedUsedBikes(): Promise<UsedSeedResult> {
  const payload = await getPayload({ config })
  const result: UsedSeedResult = { created: 0, existing: 0, skipped: 0 }

  const brandSlugToId = await loadBrandIds(payload)

  for (const sample of SAMPLES) {
    const brandId = brandSlugToId.get(sample.brand)
    if (!brandId) {
      result.skipped++
      continue
    }

    const slug = slugify(`${sample.year}-${sample.brand}-${sample.model}-${sample.variant ?? ""}-${sample.stockNumber}`)
    const existing = await payload.find({
      collection: "used-bikes",
      where: { stockNumber: { equals: sample.stockNumber } },
      limit: 1,
    })
    if (existing.docs.length) {
      result.existing++
      continue
    }

    await payload.create({
      collection: "used-bikes",
      data: {
        stockNumber: sample.stockNumber,
        displayName: sample.displayName,
        slug,
        tagline: sample.tagline,
        description: richTextFromText(sample.description),
        year: sample.year,
        brand: brandId,
        model: sample.model,
        variant: sample.variant,
        bodyType: sample.bodyType,
        engineCc: sample.engineCc,
        transmission: sample.transmission,
        kms: sample.kms,
        condition: "used",
        color: sample.color,
        registrationStatus: sample.registrationStatus,
        registrationState: sample.registrationState,
        price: sample.price,
        priceLabel: sample.priceLabel,
        features: sample.features?.map((f) => ({ feature: f })),
        photos: [],
        listingStatus: "available",
        syndication: {
          bikesales: {
            enabled: true,
          },
        },
      },
    })
    result.created++
  }

  return result
}

async function loadBrandIds(payload: Payload) {
  const map = new Map<string, string | number>()
  const res = await payload.find({ collection: "brands", limit: 50, depth: 0 })
  for (const b of res.docs as Array<{ id: string | number; slug: string }>) {
    map.set(b.slug, b.id)
  }
  return map
}

// Minimal Lexical rich-text wrapper around a single paragraph of plain text.
function richTextFromText(text: string) {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: [
            { type: "text", text, format: 0, mode: "normal", style: "", detail: 0, version: 1 },
          ],
        },
      ],
    },
  } as unknown as never
}
