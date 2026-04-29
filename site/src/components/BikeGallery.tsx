"use client"

import Image from "next/image"
import { type ReactNode, useMemo, useState } from "react"

export type BikeGalleryColor = {
  name: string
  hex?: string
  imageUrl?: string
}

export function BikeShowcase({
  displayName,
  defaultImageUrl,
  colors,
  children,
}: {
  displayName: string
  defaultImageUrl?: string
  colors: BikeGalleryColor[]
  children: ReactNode
}) {
  const initialIndex = useMemo(() => {
    const i = colors.findIndex((c) => c.imageUrl)
    return i === -1 ? null : i
  }, [colors])
  const [selected, setSelected] = useState<number | null>(initialIndex)

  const activeColor = selected != null ? colors[selected] : undefined
  const imageSrc = activeColor?.imageUrl ?? defaultImageUrl

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="bg-zinc-50 border border-zinc-200 aspect-[4/3] relative overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={activeColor ? `${displayName} – ${activeColor.name}` : displayName}
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
              No image available
            </div>
          )}
        </div>
        {activeColor && (
          <p className="mt-3 text-center text-sm font-medium text-zinc-700">
            {activeColor.name}
          </p>
        )}
      </div>

      <div>
        {children}
        {colors.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 mb-3">
              Available colours
            </h3>
            <ul className="flex flex-wrap gap-2">
              {colors.map((c, i) => {
                const isActive = i === selected
                const clickable = Boolean(c.imageUrl)
                return (
                  <li key={`${c.name}-${i}`}>
                    <button
                      type="button"
                      onClick={() => clickable && setSelected(i)}
                      disabled={!clickable}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm transition ${
                        isActive
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-zinc-200 text-zinc-800 hover:border-zinc-400"
                      } ${clickable ? "cursor-pointer" : "cursor-default opacity-70"}`}
                    >
                      {c.hex && (
                        <span
                          aria-hidden
                          className="w-4 h-4 rounded-full border border-zinc-300"
                          style={{ background: c.hex }}
                        />
                      )}
                      {c.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
