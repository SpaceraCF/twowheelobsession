// Yamaha Motor Australia public catalogue API.
// Endpoints reverse-engineered from the existing WP plugin yamaha-woo-sync.

const BASE = 'https://api.yamaha-motor.com.au/api/products'

export type YamahaSummary = {
  ID: number
  ModelName: string
  ProductType: string
  YearModel: number
  Division: string
  ProductGroup: string
  SubCategory: string
  PrimaryCategory: string
  ItemDescription: string
  Description: string
  SummaryImage: string | null
  SummaryImage2: string | null
}

export type YamahaDetail = {
  ID: number
  ModelName: string
  Basemodel: string
  Brand: string
  ItemModelCode: string
  ItemDescription: string
  LongDescription: string
  Country: string
  Division: string
  ProductGroup: string
  ClassDescription: string
  Colour1: string | null
  Colour2: string | null
  Colour3: string | null
  Colour4: string | null
  Colour5: string | null
  Colour6: string | null
  Colour7: string | null
  Colour8: string | null
  Colour9: string | null
  Colour10: string | null
  ItemHeight: number
  ItemLength: number
  ItemWidth: number
  ItemWeight: number
  PrimaryCategory: number
  ProductSpec: Record<string, string | number | null>
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Yamaha API ${res.status} for ${url}`)
  return (await res.json()) as T
}

export function getMotorcycleSummaries() {
  return getJson<YamahaSummary[]>(`${BASE}/GetAllProductSummariesByDivision/AU/Motorcycle`)
}

export function getProductById(id: number) {
  return getJson<YamahaDetail>(`${BASE}/GetProductByID/${id}`)
}

export type YamahaColor = {
  Id?: number
  ProductId?: number
  ColorName?: string
  ColorCode?: string
  ColorImage?: string
  Active?: boolean
}
export function getProductColors(id: number) {
  return getJson<YamahaColor[]>(`${BASE}/GetProductColors/${id}`)
}
