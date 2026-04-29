"use server"

import { getPayload } from "payload"
import config from "@payload-config"

export type ServiceRequestState = {
  ok: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

export async function submitServiceRequest(
  _prev: ServiceRequestState | null,
  formData: FormData,
): Promise<ServiceRequestState> {
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    bikeMake: String(formData.get("bikeMake") ?? "").trim(),
    bikeModel: String(formData.get("bikeModel") ?? "").trim(),
    bikeYear: formData.get("bikeYear") ? Number(formData.get("bikeYear")) : undefined,
    bikeKms: formData.get("bikeKms") ? Number(formData.get("bikeKms")) : undefined,
    bikeRego: String(formData.get("bikeRego") ?? "").trim() || undefined,
    serviceType: String(formData.get("serviceType") ?? "").trim() as
      | "scheduled"
      | "repair"
      | "tyres"
      | "inspection"
      | "warranty"
      | "other",
    preferredDate: formData.get("preferredDate")
      ? String(formData.get("preferredDate"))
      : undefined,
    description: String(formData.get("description") ?? "").trim(),
  }

  const fieldErrors: Record<string, string> = {}
  if (!data.name) fieldErrors.name = "Required"
  if (!data.email) fieldErrors.email = "Required"
  if (!data.phone) fieldErrors.phone = "Required"
  if (!data.bikeMake) fieldErrors.bikeMake = "Required"
  if (!data.bikeModel) fieldErrors.bikeModel = "Required"
  if (!data.serviceType) fieldErrors.serviceType = "Required"
  if (!data.description) fieldErrors.description = "Required"

  if (Object.keys(fieldErrors).length) {
    return { ok: false, fieldErrors, error: "Please fill in the required fields." }
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: "service-requests",
      data: data as never,
    })
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not submit request. Please call us.",
    }
  }
}
