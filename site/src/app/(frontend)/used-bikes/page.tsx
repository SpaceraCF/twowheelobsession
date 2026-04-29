import Link from "next/link"
import { getPayload, type Where } from "payload"
import config from "@payload-config"

import { CatalogFilters } from "@/components/CatalogFilters"
import { UsedBikeCard } from "@/components/UsedBikeCard"

type SearchParams = Promise<{ brand?: string; category?: string; bodyType?: string }>

export const metadata = {
  title: "Motorcycle Runouts — Used & Demo Bikes | Two Wheel Obsession",
  description:
    "Quality used and demo motorcycles at Two Wheel Obsession. Yamaha, Suzuki, CFMOTO and more.",
}

export default async function UsedBikesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const payload = await getPayload({ config })

  const [brands, categories] = await Promise.all([
    payload.find({ collection: "brands", limit: 50, sort: "displayOrder" }),
    payload.find({ collection: "bike-categories", limit: 100, sort: "name" }),
  ])

  const selectedBrand = params.brand
    ? brands.docs.find((b) => (b as { slug?: string }).slug === params.brand)
    : undefined
  const selectedCategory = params.category
    ? categories.docs.find((c) => (c as { slug?: string }).slug === params.category)
    : undefined

  const where: Where = {
    listingStatus: { in: ["available", "on-hold"] },
  }
  if (selectedBrand) where.brand = { equals: selectedBrand.id }
  if (selectedCategory) where.category = { equals: selectedCategory.id }

  const bikes = await payload.find({
    collection: "used-bikes",
    where,
    limit: 96,
    sort: ["-updatedAt"],
    depth: 2,
  })

  // Counts for filter labels
  const allUsed = await payload.find({
    collection: "used-bikes",
    where: { listingStatus: { in: ["available", "on-hold"] } },
    limit: 500,
    depth: 0,
  })

  const brandCounts = new Map<number, number>()
  const categoryCounts = new Map<number, number>()
  for (const b of allUsed.docs) {
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
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Shop</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-zinc-900">Motorcycle Runouts</h1>
          <p className="mt-3 text-zinc-700 max-w-2xl">
            Quality used and demo motorcycles at Two Wheel Obsession. Stock changes weekly — call us
            on{" "}
            <a href="tel:+61243319007" className="font-semibold text-red-600 hover:underline">
              (02) 4331 9007
            </a>{" "}
            for the latest availability.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
        {bikes.totalDocs > 0 ? (
          <CatalogFilters
            brands={brandOptions}
            categories={categoryOptions}
            totalCount={bikes.totalDocs}
          />
        ) : null}

        <div className="flex-1 min-w-0">
          {bikes.docs.length === 0 ? (
            <div className="border border-dashed border-zinc-300 rounded-lg p-10 text-center bg-white">
              <h2 className="text-xl font-semibold text-zinc-900">No used bikes listed right now</h2>
              <p className="mt-3 text-zinc-700 max-w-md mx-auto">
                We turn over runouts quickly. Get in touch to ask about what's just landed or coming
                in soon.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/contact-us?type=used-bike"
                  className="inline-flex h-11 items-center px-5 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
                >
                  Make an enquiry
                </Link>
                <a
                  href="tel:+61243319007"
                  className="inline-flex h-11 items-center px-5 border border-zinc-300 text-zinc-900 font-semibold uppercase text-sm tracking-wider hover:border-zinc-700"
                >
                  Call (02) 4331 9007
                </a>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {bikes.docs.map((bike) => (
                <UsedBikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
