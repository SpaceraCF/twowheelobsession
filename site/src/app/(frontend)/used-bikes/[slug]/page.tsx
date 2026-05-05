import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import config from "@payload-config"

import { FinanceCallout } from "@/components/FinanceCallout"

type Params = Promise<{ slug: string }>

type Brand = { id: string | number; name: string; slug: string }
type Photo = { image?: { url?: string }; caption?: string }
type UsedBike = {
  id: string | number
  slug: string
  stockNumber?: string
  displayName: string
  tagline?: string
  description?: unknown
  year?: number
  brand?: Brand | string | number
  model?: string
  variant?: string
  bodyType?: string
  engineCc?: number
  cylinders?: number
  transmission?: string
  kms?: number
  condition?: string
  color?: string
  registrationStatus?: string
  registrationState?: string
  complianceDate?: string
  buildDate?: string
  price?: number
  priceLabel?: string
  features?: Array<{ feature: string }>
  photos?: Photo[]
  listingStatus?: string
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "used-bikes",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  const bike = result.docs[0] as UsedBike | undefined
  if (!bike) return { title: "Not found" }
  return {
    title: `${bike.displayName} (#${bike.stockNumber}) | Two Wheel Obsession`,
    description: bike.tagline ?? `Used ${bike.displayName} at Two Wheel Obsession.`,
  }
}

export default async function UsedBikeDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "used-bikes",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  const bike = result.docs[0] as UsedBike | undefined
  if (!bike) notFound()

  const brand = typeof bike.brand === "object" ? bike.brand : undefined
  const photos = bike.photos ?? []
  const cover = photos[0]?.image?.url

  return (
    <div className="bg-white">
      <nav className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-3 text-xs text-zinc-600 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-zinc-900">Home</Link>
          <span>/</span>
          <Link href="/used-bikes" className="hover:text-zinc-900">Motorcycle Runouts</Link>
          <span>/</span>
          <span className="text-zinc-900">{bike.displayName}</span>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="bg-zinc-50 border border-zinc-200 aspect-[4/3] relative overflow-hidden">
            {cover ? (
              <Image src={cover} alt={bike.displayName} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                No image available
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {photos.slice(1, 5).map((p, i) => (
                p.image?.url ? (
                  <div key={i} className="relative aspect-[4/3] bg-zinc-50 border border-zinc-200 overflow-hidden">
                    <Image src={p.image.url} alt={p.caption ?? `Photo ${i + 2}`} fill sizes="200px" className="object-cover" />
                  </div>
                ) : null
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {bike.condition === "demo" ? "Demo" : "Used"}
            {bike.stockNumber ? ` · Stock #${bike.stockNumber}` : ""}
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-zinc-900 leading-tight">
            {bike.displayName}
          </h1>
          {bike.tagline && <p className="mt-3 text-lg text-zinc-700 italic">{bike.tagline}</p>}

          <dl className="mt-6 grid grid-cols-2 gap-y-4 gap-x-6 text-sm border-t border-b border-zinc-200 py-5">
            <KV label="Year" value={bike.year} />
            <KV label="Kilometres" value={bike.kms != null ? `${bike.kms.toLocaleString("en-AU")} km` : undefined} />
            <KV label="Make" value={brand?.name} />
            <KV label="Model" value={[bike.model, bike.variant].filter(Boolean).join(" ") || undefined} />
            <KV label="Engine" value={bike.engineCc ? `${bike.engineCc} cc` : undefined} />
            <KV label="Transmission" value={bike.transmission} />
            <KV label="Body type" value={bike.bodyType} />
            <KV label="Colour" value={bike.color} />
            <KV
              label="Registration"
              value={bike.registrationStatus === "registered"
                ? `Registered${bike.registrationState ? ` (${bike.registrationState})` : ""}`
                : bike.registrationStatus === "unregistered"
                  ? "Unregistered"
                  : undefined}
            />
          </dl>

          {bike.price && (
            <p className="mt-6 text-3xl font-bold text-red-600">
              ${bike.price.toLocaleString("en-AU")}
              {bike.priceLabel && (
                <span className="text-base font-normal text-zinc-600 ml-2">{bike.priceLabel}</span>
              )}
            </p>
          )}

          <FinanceCallout
            bikeName={bike.displayName}
            price={bike.price}
            stockNumber={bike.stockNumber}
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/contact-us?type=used-bike&bike=${encodeURIComponent(bike.displayName)}&stock=${encodeURIComponent(bike.stockNumber ?? "")}`}
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

          {bike.features && bike.features.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 mb-3">Features</h3>
              <ul className="space-y-1.5 text-sm text-zinc-800">
                {bike.features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="text-red-600">•</span>
                    {f.feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === "") return null
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium text-zinc-900">{value}</dd>
    </div>
  )
}
