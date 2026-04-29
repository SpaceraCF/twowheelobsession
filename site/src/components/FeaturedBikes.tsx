import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"

import { BikeCard } from "@/components/BikeCard"

export async function FeaturedBikes() {
  let docs: Awaited<ReturnType<typeof getDocs>> = []
  try {
    docs = await getDocs()
  } catch (err) {
    // Silently fail (e.g. DB not reachable during build prerender). The section
    // simply doesn't render — the rest of the homepage still works.
    console.warn("[FeaturedBikes] Could not load bikes:", err instanceof Error ? err.message : err)
    return null
  }

  if (docs.length === 0) return null

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
          {docs.map((bike) => (
            <BikeCard key={bike.id} bike={bike} />
          ))}
        </div>
      </div>
    </section>
  )
}

async function getDocs() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "new-bikes",
    limit: 50,
    sort: "-year",
    depth: 1,
    where: { status: { equals: "available" } },
  })
  const pool = [...result.docs]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 8)
}
