/**
 * Header search. Deliberately a plain GET form pointed at /search —
 * no client JS, no state, works before hydration and with JS off.
 * Most visitors arrive looking for a specific bike, so this is the
 * highest-traffic control on the site and it should never be waiting
 * on a bundle to become usable.
 *
 * Rendered twice (desktop bar + mobile row), so `id` is required to
 * keep the label/input association unique.
 */
export function SearchBox({
  id,
  className = "",
  defaultValue = "",
  placeholder = "Search bikes — e.g. MT-07, Tracer, YZ250",
}: {
  id: string
  className?: string
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={`relative flex items-center ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Search motorcycles
      </label>
      <input
        id={id}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        // text-base on mobile is deliberate: anything under 16px makes
        // iOS Safari zoom the viewport on focus.
        className="w-full h-11 md:h-9 pl-4 pr-11 rounded-full border border-zinc-300 bg-white text-base md:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 inline-flex items-center justify-center h-9 w-9 md:h-7 md:w-7 rounded-full text-zinc-500 hover:text-red-600 hover:bg-zinc-100 transition-colors"
      >
        <SearchIcon />
      </button>
    </form>
  )
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
