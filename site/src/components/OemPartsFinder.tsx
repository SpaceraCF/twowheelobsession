import Image from "next/image"
import Link from "next/link"

export function OemPartsFinder() {
  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-12 flex justify-center">
        <Link href="/oem-parts-finder" className="group hover:opacity-80">
          <Image
            src="/oem-parts-finder.png"
            alt="Yamaha OEM Parts Finder"
            width={620}
            height={194}
            className="h-20 md:h-24 w-auto"
          />
        </Link>
      </div>
    </section>
  )
}
