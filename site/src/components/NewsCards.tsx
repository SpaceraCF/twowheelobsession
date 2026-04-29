import Image from "next/image"
import Link from "next/link"

const ITEMS = [
  {
    image: "/news/cfmoto-1000mt-x.jpg",
    title: "The all-new CFMOTO 1000MT-X",
    body: "Pre-order yours today.",
    href: "/new-bikes?brand=cfmoto",
  },
  {
    image: "/news/finance-1pc.jpg",
    title: "1% finance deals",
    body: "P.A. comparison rate finance on MY26 and earlier WR450F (24- and 36-month terms).",
    href: "/contact-us",
  },
  {
    image: "/news/suzuki-40-years.jpg",
    title: "Suzuki — 40 years strong",
    body: "Celebrating four decades of legendary motorcycles in Australia.",
    href: "/new-bikes?brand=suzuki",
  },
]

export function NewsCards() {
  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-wide uppercase text-zinc-900">
          Latest News
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group block bg-white border border-zinc-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="aspect-square bg-white relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg leading-tight text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-700 leading-relaxed">{item.body}</p>
                <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-red-600">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
