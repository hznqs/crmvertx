"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type { ContractStatus } from "@/lib/types/contracts";

type ContractPayload = {
  clientId: string;
  serviceIds: string[];
  serviceId: string | null;
  projectId: string | null;
  sellerName: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
  implementationFee: number;
  discount: number;
  durationMonths: number;
  billingDueDay: number | null;
  paymentMethod: string;
  notes: string;
  generateProject: boolean;
  active: boolean;
};

export async function createContractAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateContractBackend("/api/contracts", "POST", contractPayloadFromForm(formData));
    revalidatePath("/contracts");
  }, "Nao foi possivel salvar o contrato");
}

export async function updateContractAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateContractBackend(
      `/api/contracts/${encodeURIComponent(id)}`,
      "PUT",
      contractPayloadFromForm(formData)
    );
    revalidatePath("/contracts");
  }, "Nao foi possivel salvar o contrato");
}

export async function deleteContractAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateContractBackend(`/api/contracts/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/contracts");
  }, "Nao foi possivel excluir o contrato");
}

export async function cancelContractAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateContractBackend(`/api/contracts/${encodeURIComponent(id)}/cancel`, "PATCH", lifecyclePayloadFromForm(formData));
    revalidatePath("/contracts");
    revalidatePath("/dashboard");
  }, "Nao foi possivel cancelar o contrato");
}

export async function nonRenewContractAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateContractBackend(`/api/contracts/${encodeURIComponent(id)}/non-renew`, "PATCH", lifecyclePayloadFromForm(formData));
    revalidatePath("/contracts");
    revalidatePath("/dashboard");
  }, "Nao foi possivel marcar contrato como nao renovado");
}

export async function renewContractAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateContractBackend(`/api/contracts/${encodeURIComponent(id)}/renew`, "POST", contractPayloadFromForm(formData));
    revalidatePath("/contracts");
    revalidatePath("/dashboard");
  }, "Nao foi possivel renovar o contrato");
}

function contractPayloadFromForm(formData: FormData): ContractPayload {
  const serviceIds = serviceIdsFromForm(formData);
  if (serviceIds.length === 0) {
    throw new Error("Selecione pelo menos um servico para o contrato");
  }

  return {
    clientId: requiredString(formData.get("clientId")),
    serviceIds,
    serviceId: serviceIds[0] ?? null,
    projectId: nullableString(formData.get("projectId")),
    sellerName: stringFromForm(formData.get("sellerName")),
    plan: requiredString(formData.get("plan")),
    startDate: requiredString(formData.get("startDate")),
    endDate: requiredString(formData.get("endDate")),
    status: requiredString(formData.get("status")) as ContractStatus,
    autoRenew: formData.get("autoRenew") === "true",
    implementationFee: numberFromForm(formData.get("implementationFee")),
    discount: numberFromForm(formData.get("discount")),
    durationMonths: Math.max(1, numberFromForm(formData.get("durationMonths"))),
    billingDueDay: nullableNumber(formData.get("billingDueDay")),
    paymentMethod: stringFromForm(formData.get("paymentMethod")),
    notes: stringFromForm(formData.get("notes")),
    generateProject: formData.get("generateProject") === "true",
    active: formData.get("active") !== "false"
  };
}

function serviceIdsFromForm(formData: FormData) {
  return formData.getAll("serviceIds")
    .map((value) => stringFromForm(value))
    .filter(Boolean);
}

async function mutateContractBackend(
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
    throw new Error(contractBackendErrorMessage(error));
  }
}

function lifecyclePayloadFromForm(formData: FormData) {
  return {
    date: nullableString(formData.get("date")),
    reason: stringFromForm(formData.get("reason")),
    notes: stringFromForm(formData.get("notes"))
  };
}

function contractBackendErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Nao foi possivel salvar o contrato";
  }

  const payload = error as { message?: unknown; fields?: unknown };
  const message = typeof payload.message === "string" ? payload.message : "Nao foi possivel salvar o contrato";

  if (!payload.fields || typeof payload.fields !== "object") {
    return message;
  }

  const fieldMessages = Object.entries(payload.fields as Record<string, unknown>)
    .map(([field, fieldMessage]) => {
      if (typeof fieldMessage !== "string" || !fieldMessage.trim()) return null;
      return `${field}: ${fieldMessage}`;
    })
    .filter(Boolean);

  return fieldMessages.length > 0 ? `${message}: ${fieldMessages.join("; ")}` : message;
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
  return numberFromFormValue(value);
}
