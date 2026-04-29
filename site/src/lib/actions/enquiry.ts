"use server"

import { getPayload } from "payload"
import config from "@payload-config"

export type EnquiryState = {
  ok: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

const VALID_TYPES = ["new-bike", "used-bike", "parts", "general"] as const
type EnquiryType = (typeof VALID_TYPES)[number]

export async function submitEnquiry(
  _prev: EnquiryState | null,
  formData: FormData,
): Promise<EnquiryState> {
  const data = {
    type: String(formData.get("type") ?? "general") as EnquiryType,
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    subject: String(formData.get("subject") ?? "").trim() || undefined,
    message: String(formData.get("message") ?? "").trim(),
    pageUrl: String(formData.get("pageUrl") ?? "").trim() || undefined,
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
