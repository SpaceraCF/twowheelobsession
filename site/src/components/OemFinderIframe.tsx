"use client"

import { useEffect, useRef, useState } from "react"

// Auto-resizing iframe wrapper for the Yamaha OEM Parts Finder. The
// widget at /oem-widget posts `{type:'ypa:widget:resize', height}`
// messages whenever its content changes; we listen and update the
// iframe's height so there's no empty whitespace below the filter
// panel when nothing's selected, and no inner scrollbar once parts
// are loaded.
//
// The same-origin guard mirrors the cart bridge — both iframes serve
// from this app, so any message from a different origin is ignored.

const INITIAL_HEIGHT = 220 // fits the dropdown filter panel + padding

const MIN_HEIGHT = 160
const MAX_HEIGHT = 2000

type OemFinderIframeProps = {
  className?: string
  /** Inset border. Defaults to a subtle zinc rule. */
  bordered?: boolean
}

export function OemFinderIframe({ className, bordered = true }: OemFinderIframeProps) {
  const [height, setHeight] = useState<number>(INITIAL_HEIGHT)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (ev.origin !== window.location.origin) return
      const data = ev.data as unknown
      if (typeof data !== "object" || data === null) return
      const d = data as Record<string, unknown>
      if (d.type !== "ypa:widget:resize") return
      const raw = Number(d.height)
      if (!Number.isFinite(raw)) return
      const clamped = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(raw)))
      // Only grow / shrink when the change is meaningful; avoids
      // re-render thrash while the EPC plugin is mid-paint.
      setHeight((current) => (Math.abs(current - clamped) >= 4 ? clamped : current))
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  // Tell the iframe we're listening — covers the race where the
  // widget's first height message lands before our `message`
  // listener attached. The widget script re-emits its current
  // height on receipt of `ypa:parent:ready`.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    function ping() {
      try {
        iframe?.contentWindow?.postMessage(
          { type: "ypa:parent:ready" },
          window.location.origin,
        )
      } catch {
        /* same-origin only — should not throw */
      }
    }
    iframe.addEventListener("load", ping)
    // Also try once immediately in case the iframe was already loaded
    // before this effect ran (browser-cached bfcache, e.g.).
    ping()
    return () => iframe.removeEventListener("load", ping)
  }, [])

  return (
    <iframe
      ref={iframeRef}
      title="Yamaha Genuine Parts Finder"
      src="/oem-widget"
      className={`block w-full bg-white ${bordered ? "border border-zinc-200" : ""} ${className ?? ""}`.trim()}
      style={{
        height: `${height}px`,
        transition: "height 220ms ease",
      }}
      loading="lazy"
    />
  )
}
