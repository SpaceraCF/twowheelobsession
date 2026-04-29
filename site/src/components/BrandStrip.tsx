import Link from "next/link"

const BRANDS = [
  { name: "Yamaha", href: "/new-bikes?brand=yamaha", color: "from-red-600 to-red-800" },
  { name: "Suzuki", href: "/new-bikes?brand=suzuki", color: "from-yellow-500 to-yellow-700" },
  { name: "CFMOTO", href: "/new-bikes?brand=cfmoto", color: "from-zinc-700 to-zinc-900" },
]

export function BrandStrip() {
  return (
    <section className="border-b border-[--color-line] bg-[--color-bg-alt]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[--color-ink-muted]">
          Authorised dealer
        </p>
        <h2 className="mt-2 text-2xl font-bold">Shop by brand</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              className={`relative h-32 rounded-md bg-gradient-to-br ${b.color} text-white flex items-center justify-center font-[family-name:var(--font-display)] text-4xl tracking-wide overflow-hidden group`}
            >
              <span className="relative z-10 group-hover:scale-105 transition-transform">{b.name}</span>
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
