"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type { CostCenter, FinanceEntryStatus, FinanceEntryType } from "@/lib/types/finance";

type FinancePayload = {
  clientId: string | null;
  contractId: string | null;
  projectId: string | null;
  serviceId: string | null;
  type: FinanceEntryType;
  status: FinanceEntryStatus;
  description: string;
  value: number;
  due: string;
  recurring: boolean;
  autoBilling: boolean;
  costCenter: CostCenter;
  paymentMethod: string;
  notes: string;
  active: boolean;
};

export async function createFinanceEntryAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateFinanceBackend("/api/finance-entries", "POST", financePayloadFromForm(formData));
    revalidatePath("/finance");
  }, "Nao foi possivel salvar o lancamento");
}

export async function updateFinanceEntryAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateFinanceBackend(`/api/finance-entries/${encodeURIComponent(id)}`, "PUT", financePayloadFromForm(formData));
    revalidatePath("/finance");
  }, "Nao foi possivel salvar o lancamento");
}

export async function deleteFinanceEntryAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateFinanceBackend(`/api/finance-entries/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/finance");
  }, "Nao foi possivel excluir o lancamento");
}

function financePayloadFromForm(formData: FormData): FinancePayload {
  return {
    clientId: nullableString(formData.get("clientId")),
    contractId: nullableString(formData.get("contractId")),
    projectId: nullableString(formData.get("projectId")),
    serviceId: nullableString(formData.get("serviceId")),
    type: requiredString(formData.get("type")) as FinanceEntryType,
    status: requiredString(formData.get("status")) as FinanceEntryStatus,
    description: requiredString(formData.get("description")),
    value: numberFromForm(formData.get("value")),
    due: requiredString(formData.get("due")),
    recurring: formData.get("recurring") === "true",
    autoBilling: formData.get("autoBilling") === "true",
    costCenter: requiredString(formData.get("costCenter")) as CostCenter,
    paymentMethod: stringFromForm(formData.get("paymentMethod")),
    notes: stringFromForm(formData.get("notes")),
    active: formData.get("active") !== "false"
  };
}

async function mutateFinanceBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar o lancamento");
  }
}

function requiredString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  if (!normalizedValue) {
    throw new Error("Campo obrigatorio ausente");
  }
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
  return numberFromFormValue(value);
}
