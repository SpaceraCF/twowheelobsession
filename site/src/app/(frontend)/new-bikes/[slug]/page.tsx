import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import config from "@payload-config"

type Params = Promise<{ slug: string }>

type Brand = { id: string | number; name: string; slug: string }
type Category = { id: string | number; name: string; slug: string; group?: string }
type Color = { name?: string; hex?: string; image?: unknown }
type Bike = {
  id: string | number
  slug: string
  displayName: string
  year?: number
  modelCode?: string
  baseModel?: string
  tagline?: string
  description?: unknown
  externalImageUrl?: string
  primaryImage?: unknown
  brand?: Brand | string | number
  category?: Category | string | number
  price?: number
  priceLabel?: string
  colors?: Color[]
  specs?: Record<string, string | undefined>
  features?: Array<{ feature: string }>
  source?: string
  externalId?: string
  lastSyncedAt?: string
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "new-bikes",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  const bike = result.docs[0] as Bike | undefined
  if (!bike) return { title: "Not found" }
  const brandName = typeof bike.brand === "object" ? bike.brand?.name : ""
  return {
    title: `${bike.year ?? ""} ${brandName} ${bike.displayName} | Two Wheel Obsession`.trim(),
    description: bike.tagline ?? `${brandName} ${bike.displayName} new motorcycle at Two Wheel Obsession.`,
  }
}

export default async function NewBikeDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "new-bikes",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  const bike = result.docs[0] as Bike | undefined
  if (!bike) notFound()

  const brand = typeof bike.brand === "object" ? bike.brand : undefined
  const category = typeof bike.category === "object" ? bike.category : undefined
  const specs = bike.specs ?? {}
  const filledSpecs = SPEC_ORDER.filter(([key]) => specs[key])

  return (
    <div className="bg-white">
      <nav className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-3 text-xs text-zinc-600 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-zinc-900">Home</Link>
          <span>/</span>
          <Link href="/new-bikes" className="hover:text-zinc-900">New Motorcycles</Link>
          {brand && (
            <>
              <span>/</span>
              <Link href={`/new-bikes?brand=${brand.slug}`} className="hover:text-zinc-900">
                {brand.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-900">{bike.displayName}</span>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="bg-zinc-50 border border-zinc-200 aspect-[4/3] relative overflow-hidden">
          {bike.externalImageUrl ? (
            <Image
              src={bike.externalImageUrl}
              alt={bike.displayName}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
              No image available
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {brand?.name}
            {category ? ` · ${category.name}` : ""}
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
            {bike.year ? `${bike.year} ` : ""}
            {bike.displayName}
          </h1>
          {bike.tagline && (
            <p className="mt-3 text-lg text-zinc-700 italic">{bike.tagline}</p>
          )}

          {(bike.modelCode || bike.baseModel) && (
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm border-t border-b border-zinc-200 py-4">
              {bike.modelCode && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">Model code</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{bike.modelCode}</dd>
                </div>
              )}
              {bike.baseModel && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-500">Base model</dt>
                  <dd className="mt-1 font-medium text-zinc-900">{bike.baseModel}</dd>
                </div>
              )}
            </dl>
          )}

          {bike.price && (
            <p className="mt-6 text-3xl font-bold text-red-600">
              ${bike.price.toLocaleString("en-AU")}
              {bike.priceLabel && (
                <span className="text-base font-normal text-zinc-600 ml-2">{bike.priceLabel}</span>
              )}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/contact-us?type=new-bike&bike=${encodeURIComponent(bike.displayName)}`}
              className="inline-flex h-12 items-center px-6 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
            >
              Enquire
            </Link>
            <a
              href="tel:+61243319007"
              className="inline-flex h-12 items-center px-6 border border-zinc-300 text-zinc-900 font-semibold uppercase text-sm tracking-wider hover:border-zinc-700"
            >
              Call (02) 4331 9007
            </a>
          </div>

          {bike.colors && bike.colors.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 mb-3">
                Available colours
              </h3>
              <ul className="flex flex-wrap gap-2">
                {bike.colors.map((c, i) => (
                  <li
                    key={`${c.name}-${i}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-200 rounded-full text-sm text-zinc-800"
                  >
                    {c.hex && (
                      <span
                        aria-hidden
                        className="w-4 h-4 rounded-full border border-zinc-300"
                        style={{ background: c.hex }}
                      />
                    )}
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {filledSpecs.length > 0 && (
        <section className="bg-zinc-50 border-t border-zinc-200">
          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold text-zinc-900">Specifications</h2>
            <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-3 text-sm">
              {filledSpecs.map(([key, label]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
                  <dt className="text-zinc-600">{label}</dt>
                  <dd className="text-zinc-900 font-medium text-right">{specs[key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {bike.source === "yamaha-api" && bike.lastSyncedAt && (
        <p className="max-w-[1400px] mx-auto px-6 py-4 text-xs text-zinc-400">
          Synced from Yamaha Motor Australia · {new Date(bike.lastSyncedAt).toLocaleString("en-AU")}
        </p>
      )}
    </div>
  )
}

const SPEC_ORDER: Array<[string, string]> = [
  ["engineDisplacement", "Engine displacement"],
  ["engineType", "Engine type"],
  ["bore", "Bore × stroke"],
  ["compression", "Compression ratio"],
  ["fuelTank", "Fuel tank"],
  ["transmission", "Transmission"],
  ["weight", "Weight"],
  ["seatHeight", "Seat height"],
  ["frontBrakes", "Front brakes"],
  ["rearBrakes", "Rear brakes"],
  ["frontSuspension", "Front suspension"],
  ["rearSuspension", "Rear suspension"],
  ["frontTyre", "Front tyre"],
  ["rearTyre", "Rear tyre"],
]
