import Link from "next/link"

export const metadata = {
  title: "Yamaha OEM Parts Finder | Two Wheel Obsession",
  description:
    "Look up genuine Yamaha OEM parts by model. Direct integration with the EPC Online parts catalogue.",
}

export default function OemPartsFinderPage() {
  return (
    <div className="bg-zinc-50">
      <div className="max-w-[1400px] mx-auto px-6 pt-5 pb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-zinc-600">
          Can&rsquo;t find your part?{" "}
          <a
            href="tel:+61243319007"
            className="font-semibold text-zinc-900 hover:text-red-600"
          >
            (02) 4331 9007
          </a>
        </p>
        <Link
          href="/contact-us?type=parts"
          className="rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-700"
        >
          Send parts enquiry
        </Link>
      </div>
      <iframe
        title="Yamaha OEM Parts Finder"
        src="/oem-widget"
        className="block w-full"
        style={{ height: "min(90vh, 1400px)", minHeight: 800, border: 0 }}
        loading="lazy"
      />
    </div>
  )
}
