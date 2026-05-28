"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { GoalType } from "@/lib/types/goals";

type GoalPayload = {
  type: GoalType;
  target: number;
  actual: number;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
  active: boolean;
};

export async function createGoalAction(formData: FormData) {
  await mutateGoalBackend("/api/goals", "POST", goalPayloadFromForm(formData));
  revalidatePath("/goals");
}

export async function updateGoalAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateGoalBackend(`/api/goals/${encodeURIComponent(id)}`, "PUT", goalPayloadFromForm(formData));
  revalidatePath("/goals");
}

export async function deleteGoalAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateGoalBackend(`/api/goals/${encodeURIComponent(id)}`, "DELETE");
  revalidatePath("/goals");
}

function goalPayloadFromForm(formData: FormData): GoalPayload {
  return {
    type: requiredString(formData.get("type")) as GoalType,
    target: numberFromForm(formData.get("target")),
    actual: numberFromForm(formData.get("actual")),
    date: requiredString(formData.get("date")),
    periodStart: nullableString(formData.get("periodStart")),
    periodEnd: nullableString(formData.get("periodEnd")),
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
    throw new Error(error?.message ?? "Nao foi possivel salvar a meta");
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
