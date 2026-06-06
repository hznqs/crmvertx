"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type { ServiceBillingType, ServiceCategory } from "@/lib/types/services";

type ServicePayload = {
  name: string;
  category: ServiceCategory;
  description: string;
  notes: string;
  billingType: ServiceBillingType;
  basePrice: number;
  slaDays: number;
  estimatedHours: number;
  defaultChecklist: string;
  deliveryStages: string;
  commissionPercentage: number;
  grossMarginPercentage: number;
  active: boolean;
};

export async function createServiceAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateServiceBackend("/api/services", "POST", servicePayloadFromForm(formData));
    revalidatePath("/services");
  }, "Nao foi possivel salvar o servico");
}

export async function updateServiceAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateServiceBackend(
      `/api/services/${encodeURIComponent(id)}`,
      "PUT",
      servicePayloadFromForm(formData)
    );
    revalidatePath("/services");
  }, "Nao foi possivel salvar o servico");
}

export async function deleteServiceAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateServiceBackend(`/api/services/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/services");
  }, "Nao foi possivel excluir o servico");
}

function servicePayloadFromForm(formData: FormData): ServicePayload {
  return {
    name: requiredString(formData.get("name")),
    category: requiredString(formData.get("category")) as ServiceCategory,
    description: stringFromForm(formData.get("description")),
    notes: stringFromForm(formData.get("notes")),
    billingType: requiredString(formData.get("billingType")) as ServiceBillingType,
    basePrice: numberFromForm(formData.get("basePrice")),
    slaDays: numberFromForm(formData.get("slaDays")),
    estimatedHours: numberFromForm(formData.get("estimatedHours")),
    defaultChecklist: stringFromForm(formData.get("defaultChecklist")),
    deliveryStages: stringFromForm(formData.get("deliveryStages")),
    commissionPercentage: numberFromForm(formData.get("commissionPercentage")),
    grossMarginPercentage: numberFromForm(formData.get("grossMarginPercentage")),
    active: formData.get("active") !== "false"
  };
}

async function mutateServiceBackend(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE",
  payload?: Record<string, unknown>
) {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    method,
    headers: {
      ...(payload ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: payload ? JSON.stringify(payload) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Nao foi possivel salvar o servico");
  }
}

function requiredString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  if (!normalizedValue) throw new Error("Campo obrigatorio ausente");
  return normalizedValue;
}

function stringFromForm(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function numberFromForm(value: FormDataEntryValue | null) {
  return numberFromFormValue(value);
}
