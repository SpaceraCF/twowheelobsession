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
  const activeCount = (currentBrand ? 1 : 0) + (currentCategory ? 1 : 0)

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

  const groups = (
    <>
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

      {activeCount > 0 && (
        <Link
          href={pathname}
          className="inline-flex items-center h-11 text-xs font-semibold uppercase tracking-wider text-red-600 hover:text-red-800"
        >
          Clear filters
        </Link>
      )}
    </>
  )

  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      {/* On a phone the filter list used to push every bike below the
          fold — you scrolled through two full option lists before
          seeing a single motorcycle. Collapsed by default under lg. */}
      <details className="lg:hidden bg-white border border-zinc-200">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-4 h-12 font-semibold text-sm text-zinc-900">
          <span>
            Filters
            {activeCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                {activeCount}
              </span>
            )}
          </span>
          <span className="text-zinc-500 text-sm">{totalCount} bikes</span>
        </summary>
        <div className="px-4 pb-4 space-y-6 border-t border-zinc-100 pt-4">{groups}</div>
      </details>

      <div className="hidden lg:block space-y-8">
        <div className="text-sm text-zinc-700">
          <strong className="text-zinc-900">{totalCount}</strong> bikes
        </div>
        {groups}
      </div>
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
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-900 mb-2">
        {label}
      </h3>
      <ul>
        <li>
          <FilterButton
            active={current === ""}
            onClick={() => onSelect("")}
            label="All"
          />
        </li>
        {options.map((opt) => (
          <li key={opt.value}>
            <FilterButton
              active={current === opt.value}
              onClick={() => onSelect(opt.value)}
              label={opt.label}
              count={opt.count}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // min-h-11 keeps the tap target at 44px — these were bare text
      // rows about 20px tall, which is a miss on a phone.
      className={`text-sm w-full text-left flex justify-between items-center gap-2 min-h-11 lg:min-h-0 lg:py-1 ${
        active ? "font-semibold text-red-600" : "text-zinc-700 hover:text-zinc-900"
      }`}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="text-zinc-400 text-xs tabular-nums">{count}</span>
      )}
    </button>
  )
}
