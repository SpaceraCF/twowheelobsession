import { FeaturedBikes } from "@/components/FeaturedBikes"
import { Hero } from "@/components/Hero"
import { NewsCards } from "@/components/NewsCards"
import { OemPartsFinder } from "@/components/OemPartsFinder"
import { PaymentPromoBanner } from "@/components/SiteFooter"

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
      {/* Pay-later banner is parts/accessories-only — bikes use the
          Finance enquiry CTA on each bike page. */}
      <PaymentPromoBanner />
    </>
  )
}
