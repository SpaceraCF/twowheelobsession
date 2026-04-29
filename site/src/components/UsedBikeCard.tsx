import Image from "next/image"
import Link from "next/link"

import type { UsedBike } from "@/payload-types"

export function UsedBikeCard({ bike }: { bike: UsedBike }) {
  const slug = bike.slug ?? ""
  const displayName = bike.displayName ?? "Untitled"
  const kms = bike.kms ?? undefined
  const price = bike.price ?? undefined
  const priceLabel = bike.priceLabel ?? undefined
  const status = bike.listingStatus ?? undefined
  const photos = bike.photos ?? []
  const firstPhoto = photos[0]
  const photoUrl =
    firstPhoto && typeof firstPhoto.image === "object" ? firstPhoto.image.url : undefined
  const brandName = typeof bike.brand === "object" && bike.brand ? bike.brand.name : undefined
  const stockNumber = bike.stockNumber ?? undefined

  return (
    <Link
      href={`/used-bikes/${slug}`}
      className="group block bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
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
        {status && status !== "available" && (
          <span className="absolute top-3 left-3 bg-zinc-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            {status === "on-hold" ? "On hold" : status}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {brandName}
          {stockNumber ? ` · #${stockNumber}` : ""}
        </p>
        <h3 className="mt-1 font-semibold text-base text-zinc-900">{displayName}</h3>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="text-sm text-zinc-600">
            {kms != null ? `${kms.toLocaleString("en-AU")} km` : "—"}
          </p>
          {price ? (
            <p className="font-bold text-red-600">
              ${price.toLocaleString("en-AU")}
              {priceLabel && (
                <span className="ml-1 text-[10px] font-normal text-zinc-500 uppercase tracking-wider">
                  {priceLabel}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">Price on request</p>
          )}
        </div>
      </div>
    </Link>
  )
}
