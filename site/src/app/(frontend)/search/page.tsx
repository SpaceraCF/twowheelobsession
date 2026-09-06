import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"

import { BikeCard } from "@/components/BikeCard"
import { SearchBox } from "@/components/SearchBox"
import { UsedBikeCard } from "@/components/UsedBikeCard"
import { buildBikeWhere, matchShortcuts, tokenize } from "@/lib/search/query"

type SearchParams = Promise<{ q?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams
  const query = q?.trim()
  return {
    title: query
      ? `Search: ${query} | Two Wheel Obsession`
      : "Search | Two Wheel Obsession",
    // Search result pages are thin, infinite and duplicative — keep
    // them out of the index but let the links be followed.
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams
  const rawQuery = (q ?? "").trim()
  const tokens = tokenize(rawQuery)
  const shortcuts = matchShortcuts(rawQuery)

  let newBikes: Awaited<ReturnType<typeof findNew>> | null = null
  let usedBikes: Awaited<ReturnType<typeof findUsed>> | null = null

  if (tokens.length > 0) {
    const payload = await getPayload({ config })
    const [brandsRes, categoriesRes] = await Promise.all([
      payload.find({ collection: "brands", limit: 50, depth: 0 }),
      payload.find({ collection: "bike-categories", limit: 100, depth: 0 }),
    ])
    const brands = brandsRes.docs.map((b) => ({ id: b.id, name: b.name }))
    const categories = categoriesRes.docs.map((c) => ({ id: c.id, name: c.name }))

    ;[newBikes, usedBikes] = await Promise.all([
      findNew({ payload, tokens, brands, categories }),
      findUsed({ payload, tokens, brands, categories }),
    ])
  }

  const newCount = newBikes?.docs.length ?? 0
  const usedCount = usedBikes?.docs.length ?? 0
  const total = newCount + usedCount

  return (
    <div className="bg-zinc-50 min-h-[60vh]">
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Search</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-zinc-900">
            {rawQuery ? <>Results for “{rawQuery}”</> : "Search our bikes"}
          </h1>
          {rawQuery && (
            <p className="mt-3 text-zinc-700">
              {total === 0
                ? "No bikes matched."
                : `${total} ${total === 1 ? "bike" : "bikes"} found.`}
            </p>
          )}
          <SearchBox
            id="search-page-input"
            defaultValue={rawQuery}
            className="mt-6 w-full max-w-xl"
          />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-12">
        {shortcuts.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              Pages that might help
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shortcuts.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="block bg-white border border-zinc-200 p-5 hover:border-zinc-400 hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-zinc-900">{s.label}</p>
                  <p className="mt-1 text-sm text-zinc-600">{s.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {newCount > 0 && (
          <section>
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                New motorcycles ({newCount})
              </h2>
              <Link href="/new-bikes" className="text-sm text-red-600 hover:underline">
                Browse all new bikes
              </Link>
            </div>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {newBikes?.docs.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          </section>
        )}

        {usedCount > 0 && (
          <section>
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                Runouts &amp; used ({usedCount})
              </h2>
              <Link href="/used-bikes" className="text-sm text-red-600 hover:underline">
                Browse all runouts
              </Link>
            </div>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {usedBikes?.docs.map((bike) => (
                <UsedBikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          </section>
        )}

        {rawQuery && total === 0 && <NoResults query={rawQuery} hasShortcuts={shortcuts.length > 0} />}
        {!rawQuery && <EmptyPrompt />}
      </div>
    </div>
  )
}

function NoResults({ query, hasShortcuts }: { query: string; hasShortcuts: boolean }) {
  return (
    <section className="bg-white border border-zinc-200 p-8 max-w-2xl">
      <h2 className="text-xl font-bold text-zinc-900">
        Nothing in stock matched “{query}”
      </h2>
      <p className="mt-3 text-zinc-700 leading-relaxed">
        {hasShortcuts
          ? "The pages above might be what you're after. Otherwise, we move stock quickly — if it's not listed, call us."
          : "We move stock quickly and not everything makes it online. If you know what you're after, call us — we'll tell you what's in the shed or what we can order in."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="tel:+61243319007"
          className="inline-flex h-11 items-center px-5 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
        >
          Call (02) 4331 9007
        </a>
        <Link
          href="/contact-us"
          className="inline-flex h-11 items-center px-5 border border-zinc-300 text-zinc-900 font-semibold uppercase text-sm tracking-wider hover:border-zinc-900"
        >
          Send an enquiry
        </Link>
      </div>
      <div className="mt-6 pt-6 border-t border-zinc-200 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href="/new-bikes" className="text-red-600 hover:underline">New motorcycles</Link>
        <Link href="/used-bikes" className="text-red-600 hover:underline">Runouts &amp; used</Link>
        <Link href="/oem-parts-finder" className="text-red-600 hover:underline">Parts finder</Link>
        <Link href="/service-and-repairs" className="text-red-600 hover:underline">Service &amp; repairs</Link>
      </div>
    </section>
  )
}

function EmptyPrompt() {
  return (
    <section className="bg-white border border-zinc-200 p-8 max-w-2xl">
      <h2 className="text-xl font-bold text-zinc-900">What are you looking for?</h2>
      <p className="mt-3 text-zinc-700 leading-relaxed">
        Search by model (MT-07, Tracer 9, YZ250F), by year, or by brand. You can
        also search “service”, “parts” or “finance” to jump straight to the right
        page.
      </p>
    </section>
  )
}

type Payload = Awaited<ReturnType<typeof getPayload>>
type Lookups = { id: number; name: string }[]

function findNew({
  payload,
  tokens,
  brands,
  categories,
}: {
  payload: Payload
  tokens: string[]
  brands: Lookups
  categories: Lookups
}) {
  return payload.find({
    collection: "new-bikes",
    where: buildBikeWhere({
      tokens,
      fields: ["displayName", "tagline", "descriptionText", "modelCode", "baseModel"],
      brands,
      categories,
      base: { status: { equals: "available" } },
    }),
    limit: 24,
    sort: ["-year", "displayName"],
    depth: 1,
  })
}

function findUsed({
  payload,
  tokens,
  brands,
  categories,
}: {
  payload: Payload
  tokens: string[]
  brands: Lookups
  categories: Lookups
}) {
  return payload.find({
    collection: "used-bikes",
    where: buildBikeWhere({
      tokens,
      fields: ["displayName", "tagline", "model", "variant", "stockNumber", "color"],
      brands,
      categories,
      base: { listingStatus: { in: ["available", "on-hold"] } },
    }),
    limit: 24,
    sort: ["-year"],
    depth: 1,
  })
}
