#!/usr/bin/env node
/**
 * Cron entrypoint: triggers the Yamaha sync API endpoint.
 * Wired up as a Render cron service (see render.yaml).
 *
 * Required env:
 *   SITE_URL      e.g. https://twowo-site.onrender.com
 *   SYNC_SECRET   shared secret matching the web service
 */

const SITE_URL = process.env.SITE_URL
const SYNC_SECRET = process.env.SYNC_SECRET

if (!SITE_URL) {
  console.error("FATAL: SITE_URL not set")
  process.exit(2)
}
if (!SYNC_SECRET) {
  console.error("FATAL: SYNC_SECRET not set")
  process.exit(2)
}

const url = `${SITE_URL.replace(/\/$/, "")}/api/internal/yamaha-sync`
console.log(`POST ${url}`)

const start = Date.now()
let res
try {
  res = await fetch(url, {
    method: "POST",
    headers: {
      "x-sync-secret": SYNC_SECRET,
      "content-type": "application/json",
    },
    // Yamaha sync iterates over ~76 bikes with 2 API calls each. Allow up to 5 min.
    signal: AbortSignal.timeout(5 * 60 * 1000),
  })
} catch (err) {
  console.error("FATAL: fetch failed:", err instanceof Error ? err.message : err)
  process.exit(3)
}

const elapsedMs = Date.now() - start
const body = await res.text()
console.log(`HTTP ${res.status} in ${elapsedMs}ms`)
console.log(body.slice(0, 800))

if (!res.ok) {
  process.exit(4)
}
