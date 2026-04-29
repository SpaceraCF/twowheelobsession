# bikesales.com.au syndication feed

Public read-only export of all syndication-enabled used bikes. Designed to be polled by bikesales.com.au or any third-party listing aggregator.

## Endpoints

| URL | Format | Use |
|---|---|---|
| `GET /api/feeds/bikesales.xml` | XML (UTF-8) | bikesales / AdLoop-style aggregators |
| `GET /api/feeds/bikes.json` | JSON | Modern HTTP API consumers |

Both endpoints serve identical data — same `meta` + `entries` structure.

## Authentication

Every request must present the shared secret in **one** of:

- `?token=<FEED_SECRET>` query parameter (easier to share)
- `Authorization: Bearer <FEED_SECRET>` header (recommended for production)

Without a valid secret you get `401 unauthorized`.

The secret is set via the `FEED_SECRET` env var. Rotate it by changing the env value and re-issuing the new value to consumers.

## What's included in the feed

A bike is included when **all** of the following are true:

- `listingStatus` is `available` or `on-hold` (sold/draft/archived bikes are excluded)
- `syndication.bikesales.enabled` is checked

Staff can withhold a specific bike from the feed via the admin: untick *Status & syndication → bikesales.com.au → enabled*.

## Response headers

- `Content-Type` — `application/xml; charset=utf-8` or `application/json`
- `X-Feed-Count` — number of entries in the feed
- `X-Feed-Generated` — ISO-8601 timestamp of when this response was built
- `Cache-Control: no-store, must-revalidate` — feed is built fresh on every request

## Schema

Top-level:

```jsonc
{
  "meta": {
    "generatedAt": "2026-04-29T01:04:07.435Z",
    "dealer": "Two Wheel Obsession",
    "dealerPhone": "+61243319007",
    "dealerEmail": "enquiries@twowheelobsession.com.au",
    "dealerAddress": "169 Manns Road, West Gosford, NSW 2250",
    "siteUrl": "https://www.twowheelobsession.com.au"
  },
  "entries": [ /* one per bike — see below */ ]
}
```

Per-entry fields (alphabetical):

| Field | Type | Notes |
|---|---|---|
| `bikesalesExternalId` | string? | bikesales' internal listing ID, written back to Payload after first successful sync |
| `bodyType` | enum? | sport / naked / cruiser / sport-touring / touring / adventure / scooter / enduro / motocross / dual-sport / atv / other |
| `buildDate` | YYYY-MM-DD? | |
| `colour` | string? | |
| `complianceDate` | YYYY-MM-DD? | |
| `cylinders` | number? | |
| `description` | string | Plain-text extraction from the rich-text marketing description |
| `engineCc` | number? | |
| `engineNumber` | string? | Internal — included for the dealer feed contract, not displayed publicly |
| `features` | string[] | |
| `kms` | number | |
| `listingStatus` | `available` \| `on-hold` | |
| `listingType` | `used` \| `demo` | |
| `listingUrl` | string | Absolute URL to the public detail page |
| `make` | string | Brand name (`Yamaha` / `Suzuki` / `CFMOTO`) |
| `model` | string | |
| `photos` | `{ url, caption?, order }[]` | Photos in display order, with absolute URLs. Bikesales recommends ≥1024×768. |
| `price` | number | AUD, integer |
| `priceLabel` | string? | e.g. "Drive away", "Plus on-road costs" |
| `registrationExpiryDate` | YYYY-MM-DD? | |
| `registrationState` | enum? | NSW / VIC / QLD / WA / SA / TAS / ACT / NT |
| `registrationStatus` | enum? | `registered` / `unregistered` |
| `stockNumber` | string | Unique dealer reference |
| `tagline` | string? | Short marketing line |
| `transmission` | enum? | manual / automatic / semi-auto / cvt |
| `variant` | string? | e.g. "SP", "Sport" |
| `vin` | string? | Internal — included for the feed, not displayed publicly |
| `year` | number | |

The XML representation is a 1:1 element-per-field mapping, with attributes only on `<dealerFeed>`, `<stockList>`, `<photos>` and `<photo>`.

## What to give bikesales

When the contract is signed:

1. Confirm with bikesales which schema they want — XML (most common) or JSON.
2. Generate a strong `FEED_SECRET` (e.g. `openssl rand -hex 32`).
3. Hand them the URL with the bearer token. Example:
   - URL: `https://www.twowheelobsession.com.au/api/feeds/bikesales.xml`
   - Header: `Authorization: Bearer <secret>`
4. They'll start polling on their cadence (typically every 15–60 minutes).
5. Once they return a listing ID per bike on success, set `syndication.bikesales.externalId` on the matching used bike record (manually or via webhook — TBD when their integration spec is confirmed).
