"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type Option = { label: string; value: string; count?: number }

export function CatalogFilters({
  brands,
  categories,
  totalCount,
}: {
  brands: Option[]
  categories: Option[]
  totalCount: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const currentBrand = search.get("brand") ?? ""
  const currentCategory = search.get("category") ?? ""

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(search.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      const qs = next.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, search],
  )

  return (
    <aside className="w-full lg:w-64 lg:shrink-0 space-y-8">
      <div className="text-sm text-zinc-700">
        <strong className="text-zinc-900">{totalCount}</strong> bikes
      </div>

      <FilterGroup
        label="Brand"
        options={brands}
        current={currentBrand}
        onSelect={(v) => setParam("brand", v)}
      />

      <FilterGroup
        label="Category"
        options={categories}
        current={currentCategory}
        onSelect={(v) => setParam("category", v)}
      />

      {(currentBrand || currentCategory) && (
        <Link
          href={pathname}
          className="inline-block text-xs font-semibold uppercase tracking-wider text-red-600 hover:text-red-800"
        >
          Clear filters
        </Link>
      )}
    </aside>
  )
}

function FilterGroup({
  label,
  options,
  current,
  onSelect,
}: {
  label: string
  options: Option[]
  current: string
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-900 mb-3">
        {label}
      </h3>
      <ul className="space-y-1.5">
        <li>
          <button
            type="button"
            onClick={() => onSelect("")}
            className={`text-sm w-full text-left ${
              current === "" ? "font-semibold text-red-600" : "text-zinc-700 hover:text-zinc-900"
            }`}
          >
            All
          </button>
        </li>
        {options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`text-sm w-full text-left flex justify-between gap-2 ${
                current === opt.value
                  ? "font-semibold text-red-600"
                  : "text-zinc-700 hover:text-zinc-900"
              }`}
            >
              <span>{opt.label}</span>
              {typeof opt.count === "number" && (
                <span className="text-zinc-400 text-xs tabular-nums">{opt.count}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
