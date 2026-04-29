import Link from "next/link"

export const metadata = {
  title: "Yamaha OEM Parts Finder | Two Wheel Obsession",
  description:
    "Look up genuine Yamaha OEM parts by model. Direct integration with the EPC Online parts catalogue.",
}

export default function OemPartsFinderPage() {
  return (
    <div className="bg-white">
      <section className="bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Genuine Yamaha
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">OEM Parts Finder</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Pick your Yamaha and drill down to the exact part number. Order through the workshop —
            call{" "}
            <a href="tel:+61243319007" className="text-white underline hover:text-red-400">
              (02) 4331 9007
            </a>{" "}
            or{" "}
            <Link href="/contact-us?type=parts" className="text-white underline hover:text-red-400">
              send a parts enquiry
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-white">
        <iframe
          title="Yamaha OEM Parts Finder"
          src="/oem-widget"
          className="w-full block"
          style={{ height: "min(85vh, 1200px)", minHeight: 800, border: 0 }}
          loading="lazy"
        />
      </section>
    </div>
  )
}
