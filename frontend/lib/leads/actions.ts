"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type {
  CommercialStage,
  LeadOrigin,
  LeadStatus,
  LeadTemperature
} from "@/lib/types/leads";

type LeadPayload = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  origin: LeadOrigin;
  segment: string;
  temperature: LeadTemperature;
  potentialValue: number;
  responsibleUserId: string | null;
  notes: string;
};

export async function createLeadAction(formData: FormData) {
  const payload = leadPayloadFromForm(formData);
  await mutateLeadBackend("/api/leads", "POST", payload);
  revalidatePath("/leads");
}

export async function updateLeadAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  const payload = {
    ...leadPayloadFromForm(formData),
    status: requiredString(formData.get("status")) as LeadStatus,
    commercialStage: requiredString(formData.get("commercialStage")) as CommercialStage,
    lostReason: stringFromForm(formData.get("lostReason"))
  };

  await mutateLeadBackend(`/api/leads/${encodeURIComponent(id)}`, "PUT", payload);
  revalidatePath("/leads");
}

export async function updateLeadStageAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  const payload = {
    commercialStage: requiredString(formData.get("commercialStage")) as CommercialStage,
    lostReason: stringFromForm(formData.get("lostReason"))
  };

  await mutateLeadBackend(`/api/leads/${encodeURIComponent(id)}/stage`, "PATCH", payload);
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

export async function convertLeadAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateLeadBackend(`/api/leads/${encodeURIComponent(id)}/convert`, "PATCH");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath("/clients");
  revalidatePath("/dashboard");
}

export async function deleteLeadAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateLeadBackend(`/api/leads/${encodeURIComponent(id)}`, "DELETE");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
}

function leadPayloadFromForm(formData: FormData): LeadPayload {
  return {
    name: requiredString(formData.get("name")),
    companyName: stringFromForm(formData.get("companyName")),
    email: stringFromForm(formData.get("email")),
    phone: stringFromForm(formData.get("phone")),
    origin: requiredString(formData.get("origin")) as LeadOrigin,
    segment: stringFromForm(formData.get("segment")),
    temperature: requiredString(formData.get("temperature")) as LeadTemperature,
    potentialValue: numberFromForm(formData.get("potentialValue")),
    responsibleUserId: null,
    notes: stringFromForm(formData.get("notes"))
  };
}

async function mutateLeadBackend(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
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
    throw new Error(error?.message ?? "Nao foi possivel salvar o lead");
  }
}

function requiredString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  if (!normalizedValue) {
    throw new Error("Campo obrigatorio ausente");
  }
  return normalizedValue;
}

function stringFromForm(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function numberFromForm(value: FormDataEntryValue | null) {
  return Number(String(value ?? "0").replace(/\./g, "").replace(",", ".")) || 0;
}
