import { getPayload } from "payload"
import config from "@payload-config"

import { HeroCarousel, type HeroSlide } from "./HeroCarousel"

// Fallback slides — used if the Payload `hero-slides` collection is
// empty or unreachable (e.g. build-time when DB isn't ready, or the
// brand-new site before staff have uploaded any). Order matches what
// shipped before staff-managed slides existed.
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    src: "/hero/mt-darkside.jpg",
    alt: "Save on the Dark Side — MT-10 SP and more",
    href: "/new-bikes?brand=yamaha",
  },
  {
    src: "/hero/eofy.jpg",
    alt: "Yamaha EOFY Sale — finance and savings, offers end June 30 2026",
    href: "/new-bikes?brand=yamaha",
  },
  {
    src: "/hero/easter-funbike.jpg",
    alt: "0% finance on all new Fun Bikes — 24 month term, no deposit",
    href: "/new-bikes?category=fun-bike",
  },
  {
    src: "/hero/road-bike-finance.jpg",
    alt: "2.99% finance on selected MY26 road bikes — Plus save on YZF-R3SP",
    href: "/new-bikes?brand=yamaha",
  },
]

type SlideDoc = {
  id: number | string
  title?: string
  image?: { url?: string; alt?: string; width?: number; height?: number } | null
  linkUrl?: string | null
  order?: number | null
  active?: boolean | null
  startDate?: string | null
  endDate?: string | null
}

async function fetchActiveSlides(): Promise<HeroSlide[]> {
  try {
    const payload = await getPayload({ config })
    const now = new Date().toISOString()
    const result = await payload.find({
      collection: "hero-slides",
      where: {
        and: [
          { active: { equals: true } },
          {
            or: [
              { startDate: { exists: false } },
              { startDate: { less_than_equal: now } },
            ],
          },
          {
            or: [
              { endDate: { exists: false } },
              { endDate: { greater_than_equal: now } },
            ],
          },
        ],
      },
      sort: "order",
      limit: 20,
      depth: 1,
    })

    const slides: HeroSlide[] = []
    for (const doc of result.docs as unknown as SlideDoc[]) {
      const url = doc.image?.url
      if (!url) continue
      slides.push({
        src: url,
        alt: doc.image?.alt ?? doc.title ?? "",
        href: doc.linkUrl ?? undefined,
        width: doc.image?.width,
        height: doc.image?.height,
      })
    }
    return slides
  } catch {
    return []
  }
}

export async function Hero() {
  const fromPayload = await fetchActiveSlides()
  const slides = fromPayload.length > 0 ? fromPayload : FALLBACK_SLIDES
  return <HeroCarousel slides={slides} />
}
