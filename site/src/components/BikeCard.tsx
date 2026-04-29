import Image from "next/image"
import Link from "next/link"

import type { NewBike } from "@/payload-types"

export function BikeCard({ bike, hrefBase = "/new-bikes" }: { bike: NewBike; hrefBase?: string }) {
  const slug = bike.slug ?? ""
  const displayName = bike.displayName ?? "Untitled"
  const year = bike.year ?? undefined
  const externalImageUrl = bike.externalImageUrl ?? undefined
  const tagline = bike.tagline ?? undefined
  const brandName = typeof bike.brand === "object" && bike.brand ? bike.brand.name : undefined
  const categoryName =
    typeof bike.category === "object" && bike.category ? bike.category.name : undefined
  const price = bike.price ?? undefined

  return (
    <Link
      href={`${hrefBase}/${slug}`}
      className="group block bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden">
        {externalImageUrl ? (
          <Image
            src={externalImageUrl}
            alt={displayName}
            fill
            // Yamaha CDN images include weird URL shapes (port 443 explicit,
            // .ashx extension). Skip Next/Image optimizer — let the browser fetch direct.
            unoptimized
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {brandName}
          {categoryName ? ` · ${categoryName}` : ""}
        </p>
        <h3 className="mt-1 font-semibold text-base text-zinc-900">
          {year ? `${year} ` : ""}
          {displayName}
        </h3>
        {tagline ? <p className="mt-1 text-sm text-zinc-600 line-clamp-1">{tagline}</p> : null}
        {price ? (
          <p className="mt-2 text-sm font-semibold text-red-600">
            ${price.toLocaleString("en-AU")}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
