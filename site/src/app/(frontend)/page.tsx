import { FeaturedBikes } from "@/components/FeaturedBikes"
import { Hero } from "@/components/Hero"
import { NewsCards } from "@/components/NewsCards"
import { OemPartsFinder } from "@/components/OemPartsFinder"

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
