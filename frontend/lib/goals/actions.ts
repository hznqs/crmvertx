"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type { GoalStatus, GoalType } from "@/lib/types/goals";

type GoalPayload = {
  name: string;
  type: GoalType;
  target: number;
  actual: number;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
  responsible: string;
  status: GoalStatus;
  active: boolean;
};

export async function createGoalAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateGoalBackend("/api/goals", "POST", goalPayloadFromForm(formData));
    revalidatePath("/goals");
  }, "Nao foi possivel salvar a meta");
}

export async function updateGoalAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateGoalBackend(`/api/goals/${encodeURIComponent(id)}`, "PUT", goalPayloadFromForm(formData));
    revalidatePath("/goals");
  }, "Nao foi possivel salvar a meta");
}

export async function deleteGoalAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateGoalBackend(`/api/goals/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/goals");
  }, "Nao foi possivel excluir a meta");
}

function goalPayloadFromForm(formData: FormData): GoalPayload {
  return {
    name: stringFromForm(formData.get("name")),
    type: requiredString(formData.get("type")) as GoalType,
    target: numberFromForm(formData.get("target")),
    actual: numberFromForm(formData.get("actual")),
    date: requiredString(formData.get("date")),
    periodStart: nullableString(formData.get("periodStart")),
    periodEnd: nullableString(formData.get("periodEnd")),
    responsible: stringFromForm(formData.get("responsible")),
    status: requiredString(formData.get("status")) as GoalStatus,
    active: formData.get("active") !== "false"
  };
}

async function mutateGoalBackend(
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
    throw new Error(goalBackendErrorMessage(error));
  }
}

function goalBackendErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Nao foi possivel salvar a meta";
  }

  const payload = error as { message?: unknown; fields?: unknown };
  const message = typeof payload.message === "string" ? payload.message : "Nao foi possivel salvar a meta";
  if (!payload.fields || typeof payload.fields !== "object") {
    return message;
  }

  const fieldMessages = Object.entries(payload.fields as Record<string, unknown>)
    .map(([field, fieldMessage]) => typeof fieldMessage === "string" && fieldMessage.trim() ? `${field}: ${fieldMessage}` : null)
    .filter(Boolean);

  return fieldMessages.length > 0 ? `${message}: ${fieldMessages.join("; ")}` : message;
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
  return numberFromFormValue(value);
}
