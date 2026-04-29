import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"

import { BikeCard } from "@/components/BikeCard"

export async function FeaturedBikes() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "new-bikes",
    limit: 8,
    sort: "-year",
    depth: 1,
    where: { status: { equals: "available" } },
  })

  if (result.docs.length === 0) return null

  return (
    <section className="border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">
              Just landed
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold">New 2026 Motorcycles</h2>
          </div>
          <Link
            href="/new-bikes"
            className="text-sm font-semibold uppercase tracking-wider hover:text-red-600"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {result.docs.map((bike: Record<string, unknown>) => (
            <BikeCard key={String(bike.id)} bike={bike} />
          ))}
        </div>
      </div>
    </section>
  )
}
