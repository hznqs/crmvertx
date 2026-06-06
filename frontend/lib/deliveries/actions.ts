"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type { DeliveryPriority, DeliveryStatus } from "@/lib/types/deliveries";

type DeliveryPayload = {
  clientId: string | null;
  projectId: string | null;
  contractId: string | null;
  serviceId: string | null;
  type: string;
  title: string;
  description: string;
  owner: string;
  deadline: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  progress: number;
  tags: string;
  active: boolean;
};

export async function createDeliveryAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateDeliveryBackend("/api/deliveries", "POST", deliveryPayloadFromForm(formData));
    revalidatePath("/deliveries");
  }, "Nao foi possivel salvar a entrega");
}

export async function updateDeliveryAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateDeliveryBackend(`/api/deliveries/${encodeURIComponent(id)}`, "PUT", deliveryPayloadFromForm(formData));
    revalidatePath("/deliveries");
  }, "Nao foi possivel salvar a entrega");
}

export async function updateDeliveryStatusAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    const status = requiredString(formData.get("status")) as DeliveryStatus;
    await mutateDeliveryBackend(`/api/deliveries/${encodeURIComponent(id)}/status`, "PATCH", { status });
    revalidatePath("/deliveries");
  }, "Nao foi possivel atualizar o status da entrega");
}

export async function updateDeliveryStatusDirectAction(id: string, status: DeliveryStatus): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateDeliveryBackend(`/api/deliveries/${encodeURIComponent(id)}/status`, "PATCH", { status });
    revalidatePath("/deliveries");
  }, "Nao foi possivel atualizar o status da entrega");
}

export async function deleteDeliveryAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateDeliveryBackend(`/api/deliveries/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/deliveries");
  }, "Nao foi possivel excluir a entrega");
}

function deliveryPayloadFromForm(formData: FormData): DeliveryPayload {
  return {
    clientId: nullableString(formData.get("clientId")),
    projectId: nullableString(formData.get("projectId")),
    contractId: nullableString(formData.get("contractId")),
    serviceId: nullableString(formData.get("serviceId")),
    type: requiredString(formData.get("type")),
    title: requiredString(formData.get("title")),
    description: stringFromForm(formData.get("description")),
    owner: requiredString(formData.get("owner")),
    deadline: requiredString(formData.get("deadline")),
    status: requiredString(formData.get("status")) as DeliveryStatus,
    priority: requiredString(formData.get("priority")) as DeliveryPriority,
    progress: clamp(numberFromForm(formData.get("progress")), 0, 100),
    tags: stringFromForm(formData.get("tags")),
    active: formData.get("active") !== "false"
  };
}

async function mutateDeliveryBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar a entrega");
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
