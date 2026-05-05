"use server"

import { getPayload } from "payload"
import config from "@payload-config"

export type EnquiryState = {
  ok: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

const VALID_TYPES = ["new-bike", "used-bike", "finance", "parts", "general"] as const
type EnquiryType = (typeof VALID_TYPES)[number]

const VALID_FINANCE_TERMS = ["24", "36", "48", "60", "72"] as const
type FinanceTerm = (typeof VALID_FINANCE_TERMS)[number]

export async function submitEnquiry(
  _prev: EnquiryState | null,
  formData: FormData,
): Promise<EnquiryState> {
  const type = String(formData.get("type") ?? "general") as EnquiryType
  const isFinance = type === "finance"

  const depositRaw = String(formData.get("financeDeposit") ?? "").trim()
  const depositNum = depositRaw ? Number(depositRaw.replace(/[^0-9.]/g, "")) : undefined
  const termRaw = String(formData.get("financeTerm") ?? "").trim() as FinanceTerm | ""

  const data = {
    type,
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    subject: String(formData.get("subject") ?? "").trim() || undefined,
    message: String(formData.get("message") ?? "").trim(),
    pageUrl: String(formData.get("pageUrl") ?? "").trim() || undefined,
    ...(isFinance && {
      financeDeposit: typeof depositNum === "number" && !Number.isNaN(depositNum) ? depositNum : undefined,
      financeTradeIn: String(formData.get("financeTradeIn") ?? "").trim() || undefined,
      financeTerm: VALID_FINANCE_TERMS.includes(termRaw as FinanceTerm) ? termRaw : undefined,
    }),
  }

  const fieldErrors: Record<string, string> = {}
  if (!VALID_TYPES.includes(data.type)) fieldErrors.type = "Choose an enquiry type"
  if (!data.name) fieldErrors.name = "Required"
  if (!data.email) fieldErrors.email = "Required"
  if (!data.message) fieldErrors.message = "Required"

  if (Object.keys(fieldErrors).length) {
    return { ok: false, fieldErrors, error: "Please fill in the required fields." }
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: "enquiries",
      data: data as never,
    })
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not submit enquiry. Please call us.",
    }
  }
}
