"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type PerformancePayload = {
  clientId: string | null;
  date: string;
  leads: number;
  sales: number;
  revenue: number;
  investment: number;
  active: boolean;
};

export async function createPerformanceAction(formData: FormData) {
  await mutatePerformanceBackend("/api/performance-records", "POST", performancePayloadFromForm(formData));
  revalidatePath("/performance");
}

export async function updatePerformanceAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutatePerformanceBackend(`/api/performance-records/${encodeURIComponent(id)}`, "PUT", performancePayloadFromForm(formData));
  revalidatePath("/performance");
}

export async function deletePerformanceAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutatePerformanceBackend(`/api/performance-records/${encodeURIComponent(id)}`, "DELETE");
  revalidatePath("/performance");
}

function performancePayloadFromForm(formData: FormData): PerformancePayload {
  return {
    clientId: nullableString(formData.get("clientId")),
    date: requiredString(formData.get("date")),
    leads: numberFromForm(formData.get("leads")),
    sales: numberFromForm(formData.get("sales")),
    revenue: numberFromForm(formData.get("revenue")),
    investment: numberFromForm(formData.get("investment")),
    active: formData.get("active") !== "false"
  };
}

async function mutatePerformanceBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar performance");
  }
}

function requiredString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  if (!normalizedValue) throw new Error("Campo obrigatorio ausente");
  return normalizedValue;
}

function nullableString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  return normalizedValue || null;
}

function stringFromForm(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function numberFromForm(value: FormDataEntryValue | null) {
  return Number(String(value ?? "0").replace(/\./g, "").replace(",", ".")) || 0;
}
