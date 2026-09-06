import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"

import { JsonLd } from "@/components/JsonLd"
import { PostCard } from "@/components/PostCard"
import { MAIN_SITE_URL, breadcrumbJsonLd } from "@/lib/seo/jsonld"

const PER_PAGE = 12

type SearchParams = Promise<{ page?: string }>

export const metadata = {
  title: "Workshop News & Motorcycle Servicing Advice | Two Wheel Obsession",
  description:
    "What's been through the Two Wheel Obsession workshop in West Gosford — real servicing jobs, repairs, model advice and dealership news from the NSW Central Coast.",
  alternates: { canonical: `${MAIN_SITE_URL}/news` },
}

export default async function NewsIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: PER_PAGE,
    page: currentPage,
    depth: 1,
  })

  return (
    <div className="bg-zinc-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: MAIN_SITE_URL },
          { name: "News", url: `${MAIN_SITE_URL}/news` },
        ])}
      />

      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            From the workshop
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-zinc-900">
            News &amp; Workshop Log
          </h1>
          <p className="mt-3 text-zinc-700 max-w-2xl leading-relaxed">
            Real jobs off the workshop floor in West Gosford — services, repairs
            and the odd rebuild — plus new model news and buying advice for
            riders across the Central Coast.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {posts.docs.length === 0 ? (
          <div className="bg-white border border-zinc-200 p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-zinc-900">Nothing published yet</h2>
            <p className="mt-3 text-zinc-700 leading-relaxed">
              We&apos;re just getting started. In the meantime, give the workshop a
              call on{" "}
              <a href="tel:+61243319007" className="text-red-600 hover:underline">
                (02) 4331 9007
              </a>{" "}
              or{" "}
              <Link href="/service-and-repairs" className="text-red-600 hover:underline">
                book a service
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.docs.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {posts.totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-10 flex items-center justify-center gap-3"
              >
                {posts.hasPrevPage && (
                  <Link
                    href={`/news?page=${currentPage - 1}`}
                    className="inline-flex h-11 items-center px-5 border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 hover:border-zinc-900"
                  >
                    ← Newer
                  </Link>
                )}
                <span className="text-sm text-zinc-600">
                  Page {currentPage} of {posts.totalPages}
                </span>
                {posts.hasNextPage && (
                  <Link
                    href={`/news?page=${currentPage + 1}`}
                    className="inline-flex h-11 items-center px-5 border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 hover:border-zinc-900"
                  >
                    Older →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
