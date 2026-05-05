import Link from "next/link"

/**
 * Inline "Finance available" callout for bike detail pages. Bikes are
 * a A$5K–A$45K decision and stay high-touch — this routes to a
 * dedicated finance enquiry form rather than online checkout.
 *
 * `bikeName` and (optionally) `price` and `stockNumber` are passed
 * through to the form via URL params so the customer doesn't have to
 * retype them.
 */
export function FinanceCallout({
  bikeName,
  price,
  stockNumber,
}: {
  bikeName: string
  price?: number
  stockNumber?: string
}) {
  const params = new URLSearchParams({ type: "finance", bike: bikeName })
  if (price) params.set("price", price.toLocaleString("en-AU"))
  if (stockNumber) params.set("stock", stockNumber)
  const href = `/contact-us?${params.toString()}`

  return (
    <aside className="mt-6 border border-zinc-200 bg-zinc-50 rounded-md p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Finance available
          </p>
          <h3 className="mt-1 text-base font-semibold text-zinc-900">
            Flexible terms — talk to our finance team
          </h3>
          <p className="mt-1 text-sm text-zinc-700">
            Yamaha Motor Finance and ZIP for bikes. Approval typically takes 1–2 business
            days; staff will tailor a rate and term to your situation.
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex h-10 shrink-0 items-center px-4 bg-zinc-900 text-white font-semibold text-sm uppercase tracking-wider hover:bg-black"
        >
          Get a finance quote
        </Link>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Subject to credit assessment. Terms, conditions, fees and charges apply.
      </p>
    </aside>
  )
}
