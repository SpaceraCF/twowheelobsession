import { RichText } from "@payloadcms/richtext-lexical/react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import config from "@payload-config"

import { JsonLd } from "@/components/JsonLd"
import { PostCard, formatPostDate, postImage } from "@/components/PostCard"
import { MAIN_SITE_URL, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld"
import type { Post } from "@/payload-types"

type Params = Promise<{ slug: string }>

async function getPost(slug: string): Promise<Post | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "posts",
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
    },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Not found | Two Wheel Obsession" }

  const title = post.seoTitle || `${post.title} | Two Wheel Obsession`
  const description =
    post.seoDescription ||
    post.excerpt ||
    `From the Two Wheel Obsession workshop in West Gosford, NSW Central Coast.`
  const image = postImage(post)
  const url = `${MAIN_SITE_URL}/news/${post.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      ...(image ? { images: [{ url: image.url }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
    },
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const image = postImage(post)
  const date = formatPostDate(post.publishedAt)
  const url = `${MAIN_SITE_URL}/news/${post.slug}`

  const payload = await getPayload({ config })
  const more = await payload.find({
    collection: "posts",
    where: {
      and: [{ _status: { equals: "published" } }, { id: { not_equals: post.id } }],
    },
    sort: "-publishedAt",
    limit: 3,
    depth: 1,
  })

  const bikeLabel = [post.bikeYear, post.bikeMake, post.bikeModel]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="bg-white">
      <JsonLd
        data={[
          articleJsonLd({
            title: post.title,
            description: post.excerpt ?? undefined,
            url,
            imageUrl: image?.url,
            publishedAt: post.publishedAt ?? undefined,
            updatedAt: post.updatedAt,
            author: post.author ?? undefined,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: MAIN_SITE_URL },
            { name: "News", url: `${MAIN_SITE_URL}/news` },
            { name: post.title, url },
          ]),
        ]}
      />

      <article className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
          <Link href="/news" className="hover:text-red-600">
            ← All news
          </Link>
        </nav>

        <header className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600">
            {date}
            {post.author ? <span className="text-zinc-500"> · {post.author}</span> : null}
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-zinc-900">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-zinc-700 leading-relaxed">{post.excerpt}</p>
          )}
        </header>

        {image && (
          <div className="mt-8 relative aspect-[16/9] bg-zinc-100 overflow-hidden">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {bikeLabel && (
          <p className="mt-8 inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 text-sm text-zinc-800">
            <span className="font-semibold">Bike:</span> {bikeLabel}
          </p>
        )}

        <div className="mt-8 prose-two">
          <RichText data={post.content} />
        </div>

        <aside className="mt-12 border-t border-zinc-200 pt-8">
          <h2 className="text-xl font-bold text-zinc-900">
            Need the same job done on your bike?
          </h2>
          <p className="mt-2 text-zinc-700 leading-relaxed">
            Our West Gosford workshop services all makes — Yamaha, Suzuki, CFMOTO
            and everything else that rolls in. Book it in or give us a call.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/service-and-repairs"
              className="inline-flex h-11 items-center px-5 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
            >
              Book a service
            </Link>
            <a
              href="tel:+61243319007"
              className="inline-flex h-11 items-center px-5 border border-zinc-300 text-zinc-900 font-semibold uppercase text-sm tracking-wider hover:border-zinc-900"
            >
              (02) 4331 9007
            </a>
          </div>
        </aside>
      </article>

      {more.docs.length > 0 && (
        <section className="bg-zinc-50 border-t border-zinc-200">
          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
              More from the workshop
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.docs.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
