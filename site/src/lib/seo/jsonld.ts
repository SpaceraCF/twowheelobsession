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

export const MAIN_SITE_URL = "https://www.twowheelobsession.com.au"
export const PARTS_SITE_URL = "https://yamahapartsaustralia.com.au"

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
    // Local intent is the whole game for a dealership — "Australia"
    // alone told engines nothing about where this business actually
    // serves. SERVED_AREA names the Central Coast and its suburbs.
    areaServed: SERVED_AREA,
    hasMap: "https://www.google.com/maps/search/?api=1&query=169+Manns+Road+West+Gosford+NSW+2250",
    sameAs: [...SOCIAL, PARTS_SITE_URL],
    department: {
      "@type": "AutoRepair",
      name: "Two Wheel Obsession Workshop",
      url: `${MAIN_SITE_URL}/service-and-repairs`,
      telephone: DEALER_PHONE,
      address: DEALER_ADDRESS,
      geo: DEALER_GEO,
      openingHoursSpecification: DEALER_HOURS,
    },
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

/**
 * WebSite schema. `potentialAction` is what makes Google eligible to
 * show a sitelinks search box — it only means anything now that the
 * site actually has /search, so pass `searchPath` for the main site
 * and leave it off for the parts site.
 */
export function websiteJsonLd(opts: {
  url: string
  name: string
  alternateName?: string
  searchPath?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${opts.url}/#website`,
    url: opts.url,
    name: opts.name,
    alternateName: opts.alternateName,
    inLanguage: "en-AU",
    ...(opts.searchPath
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${opts.url}${opts.searchPath}?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
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

/**
 * The suburbs the workshop actually draws from. Listing them as
 * `areaServed` is a genuine relevance signal for queries like
 * "motorcycle service central coast" — it is not a substitute for a
 * complete Google Business Profile, which is what actually decides
 * the local pack, but it is the on-page half of the job.
 */
export const CENTRAL_COAST_SUBURBS = [
  "West Gosford",
  "Gosford",
  "Erina",
  "Terrigal",
  "Wyoming",
  "Narara",
  "Woy Woy",
  "Umina Beach",
  "Ettalong Beach",
  "Kariong",
  "Somersby",
  "Tuggerah",
  "Wyong",
  "The Entrance",
  "Bateau Bay",
  "Long Jetty",
  "Toukley",
  "Budgewoi",
  "Avoca Beach",
  "Kincumber",
  "Green Point",
  "Saratoga",
  "Point Clare",
  "Lisarow",
  "Ourimbah",
  "Berkeley Vale",
]

const SERVED_AREA = [
  {
    "@type": "AdministrativeArea" as const,
    name: "Central Coast",
    containedInPlace: {
      "@type": "State",
      name: "New South Wales",
    },
  },
  ...CENTRAL_COAST_SUBURBS.map((name) => ({ "@type": "City" as const, name })),
]

/** Service schema for the workshop — targets "motorcycle service" intent. */
export function motorcycleServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${MAIN_SITE_URL}/service-and-repairs#service`,
    name: "Motorcycle Service & Repairs",
    serviceType: "Motorcycle servicing, repairs and logbook servicing",
    url: `${MAIN_SITE_URL}/service-and-repairs`,
    provider: { "@id": `${MAIN_SITE_URL}/#dealer` },
    areaServed: SERVED_AREA,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${MAIN_SITE_URL}/service-and-repairs`,
      servicePhone: DEALER_PHONE,
      serviceLocation: {
        "@type": "AutoRepair",
        name: `${DEALER_NAME} Workshop`,
        address: DEALER_ADDRESS,
        geo: DEALER_GEO,
        telephone: DEALER_PHONE,
        openingHoursSpecification: DEALER_HOURS,
      },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Workshop services",
      itemListElement: [
        "Logbook servicing",
        "Minor and major services",
        "Tyre fitting and balancing",
        "Brake and suspension work",
        "Chain and sprocket replacement",
        "Pre-purchase inspections",
        "Warranty servicing",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  }
}

/** FAQPage — eligible for the expandable FAQ result in Google. */
export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}

/** BlogPosting — for /news/[slug]. */
export function articleJsonLd(opts: {
  title: string
  description?: string
  url: string
  imageUrl?: string
  publishedAt?: string
  updatedAt?: string
  author?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${opts.url}#post`,
    headline: opts.title.slice(0, 110),
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: opts.url,
    ...(opts.imageUrl ? { image: opts.imageUrl } : {}),
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt ?? opts.publishedAt,
    author: {
      "@type": "Person",
      name: opts.author || DEALER_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: DEALER_NAME,
      url: MAIN_SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${MAIN_SITE_URL}/two-wheel-obsession-logo.jpg`,
      },
    },
    isPartOf: { "@id": `${MAIN_SITE_URL}/#website` },
  }
}
