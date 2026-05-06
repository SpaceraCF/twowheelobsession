// Helpers that turn an Enquiry or ServiceRequest doc into a plain-text
// notification email. Kept intentionally simple — no HTML templating yet.

const ADMIN_BASE = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "")

const ENQUIRY_LABELS: Record<string, string> = {
  "new-bike": "New bike enquiry",
  "used-bike": "Used bike enquiry",
  finance: "Finance enquiry",
  parts: "Parts & accessories",
  general: "General enquiry",
}

const SERVICE_LABELS: Record<string, string> = {
  scheduled: "Scheduled service",
  repair: "Repair",
  tyres: "Tyres",
  inspection: "Roadworthy / inspection",
  warranty: "Warranty",
  other: "Other",
}

export function buildEnquiryEmail(doc: Record<string, unknown>) {
  const id = doc.id
  const type = String(doc.type ?? "general")
  const typeLabel = ENQUIRY_LABELS[type] ?? type
  const subject = `[TWO] ${typeLabel} from ${doc.name ?? "(no name)"}`

  const lines: string[] = [
    `New ${typeLabel.toLowerCase()} via the website.`,
    "",
    `Name:    ${doc.name ?? "(none)"}`,
    `Email:   ${doc.email ?? "(none)"}`,
  ]
  if (doc.phone) lines.push(`Phone:   ${doc.phone}`)
  if (doc.subject) lines.push(`Subject: ${doc.subject}`)

  if (type === "finance") {
    lines.push("")
    lines.push("Finance details:")
    if (doc.financeDeposit != null) {
      const dep = Number(doc.financeDeposit)
      lines.push(`  Deposit available: A$${Number.isFinite(dep) ? dep.toLocaleString("en-AU") : doc.financeDeposit}`)
    }
    if (doc.financeTradeIn) lines.push(`  Trade-in: ${doc.financeTradeIn}`)
    if (doc.financeTerm) lines.push(`  Preferred term: ${doc.financeTerm} months`)
    if (doc.financeDeposit == null && !doc.financeTradeIn && !doc.financeTerm) {
      lines.push("  (none provided)")
    }
  }

  lines.push("")
  lines.push("Message:")
  lines.push(String(doc.message ?? ""))
  if (doc.pageUrl) {
    lines.push("")
    lines.push(`Submitted from: ${doc.pageUrl}`)
  }
  lines.push("")
  lines.push(`Open in admin: ${ADMIN_BASE}/admin/collections/enquiries/${id}`)

  return { subject, text: lines.join("\n") }
}

type OrderLineItem = {
  sku?: unknown
  name?: unknown
  qty?: unknown
  unitPrice?: unknown
  lineTotal?: unknown
}

export function buildOrderEmail(doc: Record<string, unknown>) {
  const id = doc.id
  const orderNumber = String(doc.orderNumber ?? id)
  const subject = `[YPA Order] ${orderNumber} — ${doc.customerName ?? "(no name)"}`

  const aud = (n: unknown) => {
    const v = typeof n === "number" ? n : Number(n)
    return Number.isFinite(v) ? `A$${v.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "A$0.00"
  }

  const shippingMethod = String(doc.shippingMethod ?? "")
  const isPickup = shippingMethod === "pickup"
  const items = Array.isArray(doc.lineItems) ? (doc.lineItems as OrderLineItem[]) : []

  const lines: string[] = [
    `New parts order — paid via PayPal.`,
    "",
    `Order:    ${orderNumber}`,
    `Status:   ${doc.status ?? "paid"}`,
    "",
    "Customer:",
    `  Name:  ${doc.customerName ?? "(none)"}`,
    `  Email: ${doc.customerEmail ?? "(none)"}`,
    `  Phone: ${doc.customerPhone ?? "(none)"}`,
    "",
    `Fulfilment: ${isPickup ? "In-store pickup (West Gosford)" : "Ship — AU flat rate"}`,
  ]

  if (!isPickup) {
    const addr = [
      doc.addressLine1,
      doc.addressLine2,
      doc.suburb,
      [doc.state, doc.postcode].filter(Boolean).join(" "),
      "Australia",
    ]
      .filter((p) => typeof p === "string" && p.length > 0)
      .join(", ")
    lines.push(`Ship to:    ${addr || "(no address)"}`)
  }

  lines.push("")
  lines.push("Line items:")
  for (const li of items) {
    const sku = String(li.sku ?? "")
    const name = String(li.name ?? "")
    const qty = String(li.qty ?? "")
    const unit = aud(li.unitPrice)
    const total = aud(li.lineTotal)
    lines.push(`  ${qty}× ${sku}  ${name}  @ ${unit}  =  ${total}`)
  }

  lines.push("")
  lines.push(`Subtotal:  ${aud(doc.subtotal)}`)
  lines.push(`Shipping:  ${aud(doc.shipping)}`)
  lines.push(`Total:     ${aud(doc.total)}  (paid via PayPal)`)

  if (doc.paypalCaptureId) {
    lines.push("")
    lines.push(`PayPal capture: ${doc.paypalCaptureId} (env: ${doc.paypalEnv ?? "?"})`)
    if (doc.paypalPayerEmail) lines.push(`PayPal payer:   ${doc.paypalPayerEmail}`)
  }

  lines.push("")
  lines.push(`Open in admin: ${ADMIN_BASE}/admin/collections/orders/${id}`)

  return { subject, text: lines.join("\n") }
}

export function buildServiceRequestEmail(doc: Record<string, unknown>) {
  const id = doc.id
  const serviceType = String(doc.serviceType ?? "other")
  const serviceLabel = SERVICE_LABELS[serviceType] ?? serviceType
  const bikeLine = [doc.bikeYear, doc.bikeMake, doc.bikeModel].filter(Boolean).join(" ")
  const subject = `[TWO Service] ${serviceLabel} — ${bikeLine || doc.name}`

  const lines: string[] = [
    `New service request via the website.`,
    "",
    `Customer:`,
    `  Name:  ${doc.name ?? "(none)"}`,
    `  Email: ${doc.email ?? "(none)"}`,
    `  Phone: ${doc.phone ?? "(none)"}`,
    "",
    `Bike:`,
    `  Make/Model: ${bikeLine || "(none)"}`,
  ]
  if (doc.bikeKms) lines.push(`  Kilometres: ${doc.bikeKms}`)
  if (doc.bikeRego) lines.push(`  Rego: ${doc.bikeRego}`)
  lines.push("")
  lines.push(`Service type: ${serviceLabel}`)
  if (doc.preferredDate) lines.push(`Preferred date: ${doc.preferredDate}`)
  lines.push("")
  lines.push("Description:")
  lines.push(String(doc.description ?? ""))
  lines.push("")
  lines.push(`Open in admin: ${ADMIN_BASE}/admin/collections/service-requests/${id}`)

  return { subject, text: lines.join("\n") }
}
