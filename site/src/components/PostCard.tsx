import Image from "next/image"
import Link from "next/link"

import type { Post } from "@/payload-types"

const TYPE_LABEL: Record<string, string> = {
  workshop: "Workshop log",
  news: "News",
  guide: "Guide",
}

export function formatPostDate(value?: string | null): string {
  if (!value) return ""
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function postImage(post: Post): { url: string; alt: string } | null {
  const hero = post.heroImage
  if (hero && typeof hero === "object" && hero.url) {
    return { url: hero.url, alt: hero.alt ?? post.title }
  }
  return null
}

export function PostCard({ post }: { post: Post }) {
  const image = postImage(post)
  const date = formatPostDate(post.publishedAt)
  const typeLabel = TYPE_LABEL[post.postType ?? "workshop"] ?? "News"

  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
            Two Wheel Obsession
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-600">
          {typeLabel}
          {date ? <span className="text-zinc-500"> · {date}</span> : null}
        </p>
        <h3 className="mt-2 font-semibold text-lg leading-tight text-zinc-900">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-zinc-700 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-red-600">
          Read more →
        </span>
      </div>
    </Link>
  )
}
