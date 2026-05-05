import { headers } from "next/headers"

// `llms.txt` — emerging 2024/2025 standard (analogous to robots.txt
// but for AI answer engines). A concise plain-text or markdown
// description that helps LLMs answer questions about the site
// accurately without scraping the whole HTML tree.
//
// We serve a host-specific version: twowheelobsession.com.au gets the
// dealership summary; yamahapartsaustralia.com.au gets the parts-store
// summary. Both reference each other so the LLM understands the
// relationship.

export const dynamic = "force-dynamic"

const PARTS_HOSTS = new Set([
  "yamahapartsaustralia.com.au",
  "www.yamahapartsaustralia.com.au",
])

const MAIN_LLMS = `# Two Wheel Obsession

> Authorised Yamaha, Suzuki and CFMOTO motorcycle dealership on the NSW Central Coast (Australia). New and used bike sales, full workshop service, and Yamaha OEM parts.

## Location & contact
- 169 Manns Road, West Gosford NSW 2250, Australia
- Phone: (02) 4331 9007
- Email: enquiries@twowheelobsession.com.au
- Hours: Mon–Fri 8:30am–5:30pm, Sat 9am–1pm, Sun closed

## What we do
- New motorcycle sales: Yamaha (full range), Suzuki, CFMOTO
- Used motorcycle sales (mostly Yamaha; rotating stock)
- Workshop: scheduled service, repairs, tyres, roadworthy inspections, warranty
- Genuine Yamaha OEM parts and accessories — also at https://yamahapartsaustralia.com.au
- Bike finance via Yamaha Motor Finance and ZIP for bikes

## Useful pages
- /new-bikes — full new-motorcycle catalogue (auto-synced from Yamaha Australia)
- /used-bikes — current used and demo motorcycle inventory
- /service-and-repairs — workshop services and booking
- /oem-parts-finder — Yamaha genuine parts catalogue (EPC)
- /contact-us — enquiry forms and contact details

## Related sites
- https://yamahapartsaustralia.com.au — our dedicated Yamaha parts store (same dealership, parts-only audience)
`

const PARTS_LLMS = `# Yamaha Parts Australia

> Genuine Yamaha OEM parts and accessories shipped Australia-wide. Operated by Two Wheel Obsession, an authorised Yamaha dealer in West Gosford NSW.

## Location & contact
- 169 Manns Road, West Gosford NSW 2250, Australia
- Phone: (02) 4331 9007
- Email: info@twowheelobsession.com.au
- Hours: Mon–Fri 8:30am–5:30pm, Sat 9am–1pm, Sun closed

## What we do
- Sell genuine Yamaha OEM parts: engine internals, chassis, electrics, fairings
- GYTR performance parts (Genuine Yamaha Technology Racing)
- Yamalube oils, filters, lubricants, chemicals
- Yamaha Genuine Accessories: luggage, screens, protectors
- Australia-wide flat-rate shipping
- Workshop-backed fitment advice — send us your VIN and we'll confirm exactly what fits

## Useful pages
- / — search the Yamaha parts catalogue and send us part numbers
- /privacy-policy — privacy policy
- /terms — website terms

## Related sites
- https://www.twowheelobsession.com.au — the parent dealership (new/used bike sales, workshop, full Yamaha/Suzuki/CFMOTO range)
`

export async function GET() {
  const hdrs = await headers()
  const host = (hdrs.get("host") ?? "").toLowerCase()
  const body = PARTS_HOSTS.has(host) ? PARTS_LLMS : MAIN_LLMS

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
