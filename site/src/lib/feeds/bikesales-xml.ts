import type { FeedEntry, FeedPayload } from "./build"
import { renderXml, type XmlNode } from "./xml"

export function buildBikesalesXml(payload: FeedPayload): string {
  const root: XmlNode = {
    tag: "dealerFeed",
    attrs: {
      version: "1.0",
      schema: "twowheelobsession.dealer-feed/v1",
      generatedAt: payload.meta.generatedAt,
      dealer: payload.meta.dealer,
      siteUrl: payload.meta.siteUrl,
      count: payload.entries.length,
    },
    children: [
      dealerNode(payload),
      {
        tag: "stockList",
        attrs: { count: payload.entries.length },
        children: payload.entries.map(stockNode),
      },
    ],
  }
  return renderXml(root)
}

function dealerNode(payload: FeedPayload): XmlNode {
  return {
    tag: "dealer",
    children: [
      { tag: "name", children: payload.meta.dealer },
      { tag: "phone", children: payload.meta.dealerPhone },
      { tag: "email", children: payload.meta.dealerEmail },
      { tag: "address", children: payload.meta.dealerAddress },
      { tag: "siteUrl", children: payload.meta.siteUrl },
    ],
  }
}

function stockNode(entry: FeedEntry): XmlNode {
  const children: XmlNode[] = [
    { tag: "stockNumber", children: entry.stockNumber },
    { tag: "listingType", children: entry.listingType },
    { tag: "listingStatus", children: entry.listingStatus },
    { tag: "year", children: String(entry.year) },
    { tag: "make", children: entry.make },
    { tag: "model", children: entry.model },
  ]
  if (entry.variant) children.push({ tag: "variant", children: entry.variant })
  if (entry.bodyType) children.push({ tag: "bodyType", children: entry.bodyType })
  if (entry.engineCc != null) children.push({ tag: "engineCc", children: String(entry.engineCc) })
  if (entry.cylinders != null) children.push({ tag: "cylinders", children: String(entry.cylinders) })
  if (entry.transmission) children.push({ tag: "transmission", children: entry.transmission })
  children.push({ tag: "kms", children: String(entry.kms) })
  if (entry.colour) children.push({ tag: "colour", children: entry.colour })
  if (entry.vin) children.push({ tag: "vin", children: entry.vin })
  if (entry.engineNumber) children.push({ tag: "engineNumber", children: entry.engineNumber })
  if (entry.registrationStatus) children.push({ tag: "registrationStatus", children: entry.registrationStatus })
  if (entry.registrationState) children.push({ tag: "registrationState", children: entry.registrationState })
  if (entry.registrationExpiryDate) children.push({ tag: "registrationExpiry", children: entry.registrationExpiryDate })
  if (entry.complianceDate) children.push({ tag: "complianceDate", children: entry.complianceDate })
  if (entry.buildDate) children.push({ tag: "buildDate", children: entry.buildDate })
  children.push(
    { tag: "price", attrs: { currency: "AUD" }, children: String(entry.price) },
  )
  if (entry.priceLabel) children.push({ tag: "priceLabel", children: entry.priceLabel })
  if (entry.tagline) children.push({ tag: "tagline", children: entry.tagline })
  children.push({ tag: "description", children: entry.description })
  if (entry.features.length) {
    children.push({
      tag: "features",
      children: entry.features.map((f) => ({ tag: "feature", children: f })),
    })
  }
  children.push({
    tag: "photos",
    attrs: { count: entry.photos.length },
    children: entry.photos.map((p) => ({
      tag: "photo",
      attrs: { order: p.order, url: p.url, caption: p.caption },
      children: undefined,
    })),
  })
  children.push({ tag: "listingUrl", children: entry.listingUrl })
  if (entry.bikesalesExternalId)
    children.push({ tag: "bikesalesId", children: entry.bikesalesExternalId })

  return { tag: "stock", children }
}
