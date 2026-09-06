import { getPayload, type Where } from "payload"
import config from "@payload-config"

import { BikeCard } from "@/components/BikeCard"
import { CatalogFilters } from "@/components/CatalogFilters"
import { JsonLd } from "@/components/JsonLd"
import { MAIN_SITE_URL, breadcrumbJsonLd } from "@/lib/seo/jsonld"

type SearchParams = Promise<{ brand?: string; category?: string }>

export const metadata = {
  title: "New Motorcycle Sales Central Coast — Yamaha, Suzuki, CFMOTO | Two Wheel Obsession",
  description:
    "New motorcycle sales on the NSW Central Coast. The full Yamaha, Suzuki and CFMOTO range at Two Wheel Obsession, West Gosford — ride-away pricing, finance and trade-ins welcome.",
  alternates: { canonical: `${MAIN_SITE_URL}/new-bikes` },
  openGraph: {
    title: "New Motorcycle Sales Central Coast | Two Wheel Obsession",
    description:
      "The full Yamaha, Suzuki and CFMOTO new bike range at our West Gosford dealership.",
    url: `${MAIN_SITE_URL}/new-bikes`,
    type: "website",
  },
}

export default async function NewBikesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const payload = await getPayload({ config })

  const [brands, categories] = await Promise.all([
    payload.find({ collection: "brands", limit: 50, sort: "displayOrder" }),
    payload.find({ collection: "bike-categories", limit: 100, sort: "name" }),
  ])

  // Resolve filter slugs to record IDs (Payload `where` queries on relationship fields use IDs).
  const selectedBrand = params.brand
    ? brands.docs.find((b) => (b as { slug?: string }).slug === params.brand)
    : undefined
  const selectedCategory = params.category
    ? categories.docs.find((c) => (c as { slug?: string }).slug === params.category)
    : undefined

  const where: Where = {
    status: { equals: "available" },
  }
  if (selectedBrand) where.brand = { equals: selectedBrand.id }
  if (selectedCategory) where.category = { equals: selectedCategory.id }

  const bikes = await payload.find({
    collection: "new-bikes",
    where,
    limit: 96,
    sort: ["-year", "displayName"],
    depth: 1,
  })

  // Build option lists with counts (only show brands/categories that have bikes).
  const allBikes = await payload.find({
    collection: "new-bikes",
    where: { status: { equals: "available" } },
    limit: 500,
    depth: 0,
  })

  const brandCounts = new Map<number, number>()
  const categoryCounts = new Map<number, number>()
  for (const b of allBikes.docs) {
    const brandId = typeof b.brand === "object" ? b.brand?.id : b.brand
    const categoryId = typeof b.category === "object" ? b.category?.id : b.category
    if (brandId != null) brandCounts.set(brandId, (brandCounts.get(brandId) ?? 0) + 1)
    if (categoryId != null) categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1)
  }

  const brandOptions = brands.docs
    .map((b) => ({ label: b.name, value: b.slug, count: brandCounts.get(b.id) ?? 0 }))
    .filter((o) => o.count > 0)

  const categoryOptions = categories.docs
    .map((c) => ({ label: c.name, value: c.slug, count: categoryCounts.get(c.id) ?? 0 }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="bg-zinc-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: MAIN_SITE_URL },
          { name: "New Motorcycles", url: `${MAIN_SITE_URL}/new-bikes` },
        ])}
      />
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Shop · West Gosford
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-zinc-900">
            New Motorcycle Sales — Central Coast
          </h1>
          <p className="mt-3 text-zinc-700 max-w-2xl leading-relaxed">
            The full Yamaha range plus selected Suzuki and CFMOTO models, in stock
            and on order at our West Gosford dealership. Yamaha pricing and specs
            sync direct from Yamaha Motor Australia, so what you see here is
            current. Finance and trade-ins welcome — <a href="tel:+61243319007" className="text-red-600 hover:underline">call (02) 4331 9007</a>.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
        <CatalogFilters
          brands={brandOptions}
          categories={categoryOptions}
          totalCount={bikes.totalDocs}
        />

        <div className="flex-1 min-w-0">
          {bikes.docs.length === 0 ? (
            <p className="text-zinc-700">No bikes match the current filters.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {bikes.docs.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
