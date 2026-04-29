import { FeaturedBikes } from "@/components/FeaturedBikes"
import { Hero } from "@/components/Hero"
import { NewsCards } from "@/components/NewsCards"
import { OemPartsFinder } from "@/components/OemPartsFinder"

// Server-render per request. The homepage queries Payload (FeaturedBikes), so
// we don't want it statically prerendered at build time when the DB may not
// be reachable.
export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <>
      <Hero />
      <OemPartsFinder />
      <NewsCards />
      <FeaturedBikes />
    </>
  )
}
