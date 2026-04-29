import Link from "next/link"

export const metadata = {
  title: "Yamaha OEM Parts Finder | Two Wheel Obsession",
  description:
    "Look up genuine Yamaha OEM parts by model. Direct integration with Yamaha Motor Australia's parts catalogue.",
}

const LIVE_URL = "https://www.twowheelobsession.com.au/oem-parts-finder/"

export default function OemPartsFinderPage() {
  return (
    <div className="bg-white">
      <section className="bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-500">
            Genuine Yamaha
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">OEM Parts Finder</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Look up the exact part number for any Yamaha model. Order through the workshop —
            call{" "}
            <a href="tel:+61243319007" className="text-white underline hover:text-red-400">
              (02) 4331 9007
            </a>{" "}
            or{" "}
            <Link href="/contact-us?type=parts" className="text-white underline hover:text-red-400">
              send an enquiry
            </Link>
            .
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Trouble loading? Open it directly in a new tab:{" "}
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="underline text-zinc-300 hover:text-white"
            >
              twowheelobsession.com.au/oem-parts-finder
            </a>
          </p>
        </div>
      </section>

      <section className="bg-white">
        <iframe
          title="Yamaha OEM Parts Finder"
          src={LIVE_URL}
          className="w-full block"
          style={{ height: "min(80vh, 1100px)", minHeight: 700, border: 0 }}
          loading="lazy"
        />
      </section>
    </div>
  )
}
