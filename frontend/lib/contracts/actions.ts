"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { ContractStatus } from "@/lib/types/contracts";

type ContractPayload = {
  clientId: string | null;
  serviceId: string | null;
  projectId: string | null;
  plan: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
  monthlyValue: number;
  totalValue: number;
  durationMonths: number;
  billingDueDay: number | null;
  active: boolean;
};

export async function createContractAction(formData: FormData) {
  await mutateContractBackend("/api/contracts", "POST", contractPayloadFromForm(formData));
  revalidatePath("/contracts");
}

export async function updateContractAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateContractBackend(
    `/api/contracts/${encodeURIComponent(id)}`,
    "PUT",
    contractPayloadFromForm(formData)
  );
  revalidatePath("/contracts");
}

export async function deleteContractAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateContractBackend(`/api/contracts/${encodeURIComponent(id)}`, "DELETE");
  revalidatePath("/contracts");
}

function contractPayloadFromForm(formData: FormData): ContractPayload {
  return {
    clientId: nullableString(formData.get("clientId")),
    serviceId: nullableString(formData.get("serviceId")),
    projectId: nullableString(formData.get("projectId")),
    plan: requiredString(formData.get("plan")),
    startDate: requiredString(formData.get("startDate")),
    endDate: requiredString(formData.get("endDate")),
    status: requiredString(formData.get("status")) as ContractStatus,
    autoRenew: formData.get("autoRenew") === "true",
    monthlyValue: numberFromForm(formData.get("monthlyValue")),
    totalValue: numberFromForm(formData.get("totalValue")),
    durationMonths: Math.max(1, numberFromForm(formData.get("durationMonths"))),
    billingDueDay: nullableNumber(formData.get("billingDueDay")),
    active: formData.get("active") !== "false"
  };
}

async function mutateContractBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar o contrato");
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

function nullableNumber(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  return normalizedValue ? numberFromForm(normalizedValue) : null;
}

function stringFromForm(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function numberFromForm(value: FormDataEntryValue | null) {
  return Number(String(value ?? "0").replace(/\./g, "").replace(",", ".")) || 0;
}
