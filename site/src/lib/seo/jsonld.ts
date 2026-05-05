// Structured data (schema.org JSON-LD) for both Two Wheel Obsession
// and Yamaha Parts Australia. Search engines (Google, Bing) and AI
// answer engines (Perplexity, ChatGPT/Bing-AI, Google AI Overviews,
// Claude) read these blocks to surface the dealership in answers like
// "yamaha dealer central coast" or "yamaha mt-07 oil filter australia".
//
// The shape follows schema.org conventions; keep IDs stable across
// pages so engines can de-duplicate (`@id` ending with `#dealer` for
// the LocalBusiness, `#org` for the Organization).
//
// Notes for 2026 SEO:
// - AutoDealer is the most specific LocalBusiness subtype that fits.
// - `sameAs` cross-references reinforce that both domains belong to
//   one entity (avoids duplicate-content / authority dilution).
// - Hours use OpeningHoursSpecification (preferred over openingHours
//   string) — modern AI engines parse it directly.

const DEALER_NAME = "Two Wheel Obsession"
const DEALER_PHONE = "+61243319007"
const DEALER_EMAIL = "enquiries@twowheelobsession.com.au"
const DEALER_ADDRESS = {
  "@type": "PostalAddress" as const,
  streetAddress: "169 Manns Road",
  addressLocality: "West Gosford",
  addressRegion: "NSW",
  postalCode: "2250",
  addressCountry: "AU",
}
const DEALER_GEO = {
  "@type": "GeoCoordinates" as const,
  latitude: -33.4289,
  longitude: 151.3279,
}
const DEALER_HOURS = [
  {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:30",
    closes: "17:30",
  },
  {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: "Saturday",
    opens: "09:00",
    closes: "13:00",
  },
]
const SOCIAL = ["https://www.facebook.com/TwoWheelObsession"]

const MAIN_SITE_URL = "https://www.twowheelobsession.com.au"
const PARTS_SITE_URL = "https://yamahapartsaustralia.com.au"

/** AutoDealer / LocalBusiness — the main TWO dealership. */
export function mainDealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${MAIN_SITE_URL}/#dealer`,
    name: DEALER_NAME,
    url: MAIN_SITE_URL,
    telephone: DEALER_PHONE,
    email: DEALER_EMAIL,
    address: DEALER_ADDRESS,
    geo: DEALER_GEO,
    openingHoursSpecification: DEALER_HOURS,
    priceRange: "$",
    areaServed: { "@type": "Country", name: "Australia" },
    sameAs: [...SOCIAL, PARTS_SITE_URL],
    brand: [
      { "@type": "Brand", name: "Yamaha" },
      { "@type": "Brand", name: "Suzuki" },
      { "@type": "Brand", name: "CFMOTO" },
    ],
    image: `${MAIN_SITE_URL}/two-wheel-obsession-logo.jpg`,
  }
}

/**
 * AutoPartsStore / LocalBusiness — the Yamaha Parts Australia spinout.
 * Same physical location as the main dealer (`sameAs` ↔ main domain
 * tells engines they're one entity, not duplicate content).
 */
export function partsStoreJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "@id": `${PARTS_SITE_URL}/#store`,
    name: "Yamaha Parts Australia",
    alternateName: DEALER_NAME,
    url: PARTS_SITE_URL,
    telephone: DEALER_PHONE,
    email: "info@twowheelobsession.com.au",
    address: DEALER_ADDRESS,
    geo: DEALER_GEO,
    openingHoursSpecification: DEALER_HOURS,
    areaServed: { "@type": "Country", name: "Australia" },
    sameAs: [...SOCIAL, MAIN_SITE_URL],
    brand: [
      { "@type": "Brand", name: "Yamaha" },
      { "@type": "Brand", name: "GYTR" },
      { "@type": "Brand", name: "Yamalube" },
    ],
    description:
      "Genuine Yamaha OEM parts and accessories shipped Australia-wide. Operated by Two Wheel Obsession, an authorised Yamaha dealer.",
  }
}

/** WebSite schema — enables sitelinks search box in Google. */
export function websiteJsonLd(opts: {
  url: string
  name: string
  alternateName?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${opts.url}/#website`,
    url: opts.url,
    name: opts.name,
    alternateName: opts.alternateName,
    inLanguage: "en-AU",
  }
}

/** BreadcrumbList — for inner pages. */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
