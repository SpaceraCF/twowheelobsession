import Image from "next/image"
import Link from "next/link"

type Bike = Record<string, unknown>

export function BikeCard({ bike, hrefBase = "/new-bikes" }: { bike: Bike; hrefBase?: string }) {
  const slug = String(bike.slug ?? "")
  const displayName = String(bike.displayName ?? "Untitled")
  const year = bike.year as number | undefined
  const externalImageUrl = bike.externalImageUrl as string | undefined
  const tagline = bike.tagline as string | undefined
  const brand = (bike.brand as { name?: string } | undefined)?.name
  const category = (bike.category as { name?: string } | undefined)?.name
  const price = bike.price as number | undefined

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
          {brand}
          {category ? ` · ${category}` : ""}
        </p>
        <h3 className="mt-1 font-semibold text-base text-zinc-900">
          {year} {displayName}
        </h3>
        {tagline ? (
          <p className="mt-1 text-sm text-zinc-600 line-clamp-1">{tagline}</p>
        ) : null}
        {price ? (
          <p className="mt-2 text-sm font-semibold text-red-600">
            ${price.toLocaleString("en-AU")}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
