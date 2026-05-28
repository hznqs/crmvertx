"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { TaskPriority, TaskStatus } from "@/lib/types/tasks";

type TaskPayload = {
  projectId: string;
  deliveryId: string | null;
  responsibleUserId: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  active: boolean;
};

export async function createTaskAction(formData: FormData) {
  await mutateTaskBackend("/api/tasks", "POST", taskPayloadFromForm(formData));
  revalidatePath("/tasks");
}

export async function updateTaskAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateTaskBackend(`/api/tasks/${encodeURIComponent(id)}`, "PUT", taskPayloadFromForm(formData));
  revalidatePath("/tasks");
}

export async function updateTaskStatusAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  const status = requiredString(formData.get("status")) as TaskStatus;
  await mutateTaskBackend(`/api/tasks/${encodeURIComponent(id)}/status`, "PATCH", { status });
  revalidatePath("/tasks");
}

export async function deleteTaskAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateTaskBackend(`/api/tasks/${encodeURIComponent(id)}`, "DELETE");
  revalidatePath("/tasks");
}

function taskPayloadFromForm(formData: FormData): TaskPayload {
  return {
    projectId: requiredString(formData.get("projectId")),
    deliveryId: nullableString(formData.get("deliveryId")),
    responsibleUserId: nullableString(formData.get("responsibleUserId")),
    title: requiredString(formData.get("title")),
    description: stringFromForm(formData.get("description")),
    priority: requiredString(formData.get("priority")) as TaskPriority,
    dueDate: requiredString(formData.get("dueDate")),
    status: requiredString(formData.get("status")) as TaskStatus,
    active: formData.get("active") !== "false"
  };
}

async function mutateTaskBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar a tarefa");
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
