"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export type HeroSlide = {
  src: string
  alt: string
  href?: string
  /** width × height of the source image, used for next/image sizing. */
  width?: number
  height?: number
}

const ROTATE_MS = 5000

/**
 * Pure presentational hero carousel — receives an already-resolved list
 * of slides and handles auto-rotate, pagination, hover-pause. The
 * source of slides (Payload collection or fallback) is decided in the
 * server-rendered `Hero` wrapper.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const id = window.setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused, slides.length])

  if (slides.length === 0) return null

  return (
    <section
      className="relative bg-black overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[1920/600]">
        {slides.map((slide, i) => {
          const visible = i === current
          const inner = (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          )
          return (
            <div
              key={`${slide.src}-${i}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                visible ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!visible}
            >
              {slide.href ? (
                <Link href={slide.href} aria-label={slide.alt} className="block w-full h-full">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </div>
          )
        })}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((slide, i) => (
            <button
              key={`${slide.src}-${i}-dot`}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "bg-white w-8" : "bg-white/40 w-2 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
