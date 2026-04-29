import Image from "next/image"
import Link from "next/link"

type UsedBike = Record<string, unknown>

export function UsedBikeCard({ bike }: { bike: UsedBike }) {
  const slug = String(bike.slug ?? "")
  const displayName = String(bike.displayName ?? "Untitled")
  const year = bike.year as number | undefined
  const kms = bike.kms as number | undefined
  const price = bike.price as number | undefined
  const priceLabel = bike.priceLabel as string | undefined
  const status = bike.listingStatus as string | undefined
  const photos = (bike.photos as Array<{ image?: { url?: string } }> | undefined) ?? []
  const photoUrl = photos[0]?.image?.url
  const brand = (bike.brand as { name?: string } | undefined)?.name
  const stockNumber = bike.stockNumber as string | undefined

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
          {brand}
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
