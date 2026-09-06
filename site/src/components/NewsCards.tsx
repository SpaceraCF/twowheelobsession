import Image from "next/image"
import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"

import { PostCard } from "./PostCard"

// Fallback cards. These were the whole section before the Posts
// collection existed; they stay as the empty state so the homepage
// never shows a blank "Latest News" heading between launch and the
// first published post.
const FALLBACK = [
  {
    image: "/news/cfmoto-1000mt-x.jpg",
    title: "The all-new CFMOTO 1000MT-X",
    body: "Pre-order yours today.",
    href: "/new-bikes?brand=cfmoto",
    fit: "cover" as const,
  },
  {
    image: "/news/finance-1pc.jpg",
    title: "1% finance deals",
    body: "P.A. comparison rate finance on MY26 and earlier WR450F (24- and 36-month terms).",
    href: "/contact-us",
  },
  {
    image: "/news/suzuki-40-years.jpg",
    title: "Suzuki — 40 years strong",
    body: "Celebrating four decades of legendary motorcycles in Australia.",
    href: "/new-bikes?brand=suzuki",
  },
]

export async function NewsCards() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 3,
    depth: 1,
  })

  const hasPosts = posts.docs.length > 0

  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide uppercase text-zinc-900">
            Latest News
          </h2>
          {hasPosts && (
            <Link
              href="/news"
              className="text-xs font-semibold uppercase tracking-wider text-red-600 hover:underline"
            >
              All news →
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {hasPosts
            ? posts.docs.map((post) => <PostCard key={post.id} post={post} />)
            : FALLBACK.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group block bg-white border border-zinc-200 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="aspect-square bg-white relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className={`${item.fit === "cover" ? "object-cover" : "object-contain"} group-hover:scale-105 transition-transform duration-500`}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg leading-tight text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-700 leading-relaxed">{item.body}</p>
                    <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-red-600">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
