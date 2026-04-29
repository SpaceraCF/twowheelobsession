import { getPayload } from "payload"
import config from "@payload-config"

import { BikeCard } from "@/components/BikeCard"
import { CatalogFilters } from "@/components/CatalogFilters"

type SearchParams = Promise<{ brand?: string; category?: string }>

export const metadata = {
  title: "Shop New Motorcycles — Yamaha, Suzuki, CFMOTO | Two Wheel Obsession",
  description:
    "Browse the full Yamaha, Suzuki and CFMOTO new motorcycle range at Two Wheel Obsession.",
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

  const where: Record<string, unknown> = {
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

  const brandCounts = new Map<string | number, number>()
  const categoryCounts = new Map<string | number, number>()
  for (const b of allBikes.docs as Array<Record<string, unknown>>) {
    if (b.brand) brandCounts.set(b.brand as string | number, (brandCounts.get(b.brand as string | number) ?? 0) + 1)
    if (b.category)
      categoryCounts.set(
        b.category as string | number,
        (categoryCounts.get(b.category as string | number) ?? 0) + 1,
      )
  }

  const brandOptions = brands.docs
    .map((b) => {
      const r = b as { id: string | number; name: string; slug: string }
      return { label: r.name, value: r.slug, count: brandCounts.get(r.id) ?? 0 }
    })
    .filter((o) => o.count > 0)

  const categoryOptions = categories.docs
    .map((c) => {
      const r = c as { id: string | number; name: string; slug: string }
      return { label: r.name, value: r.slug, count: categoryCounts.get(r.id) ?? 0 }
    })
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="bg-zinc-50">
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Shop</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-zinc-900">New Motorcycles</h1>
          <p className="mt-3 text-zinc-700 max-w-2xl">
            The full Yamaha range plus selected Suzuki and CFMOTO models. Yamaha new-bike data syncs
            hourly direct from Yamaha Motor Australia.
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
                <BikeCard key={String((bike as { id: string | number }).id)} bike={bike as Record<string, unknown>} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
