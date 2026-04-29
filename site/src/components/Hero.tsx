"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const SLIDES = [
  { src: "/hero/mt-darkside.jpg", alt: "Save on the Dark Side — MT-10 SP and more", href: "/new-bikes?brand=yamaha" },
  { src: "/hero/eofy.jpg", alt: "Yamaha EOFY Sale — finance and savings, offers end June 30 2026", href: "/new-bikes?brand=yamaha" },
  { src: "/hero/easter-funbike.jpg", alt: "0% finance on all new Fun Bikes — 24 month term, no deposit", href: "/new-bikes?category=fun-bike" },
  { src: "/hero/road-bike-finance.jpg", alt: "2.99% finance on selected MY26 road bikes — Plus save on YZF-R3SP", href: "/new-bikes?brand=yamaha" },
]

const ROTATE_MS = 5000

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setCurrent((i) => (i + 1) % SLIDES.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <section
      className="relative bg-black overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[1920/600]">
        {SLIDES.map((slide, i) => (
          <Link
            key={slide.src}
            href={slide.href}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={i !== current}
            aria-label={slide.alt}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "bg-white w-8" : "bg-white/40 w-2 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
