"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type { ProjectPriority, ProjectStatus } from "@/lib/types/projects";

type ProjectPayload = {
  clientId: string;
  contractId: string | null;
  serviceId: string | null;
  name: string;
  description: string;
  status: ProjectStatus;
  responsibleUserId: string | null;
  teamMemberIds: string;
  startDate: string | null;
  priority: ProjectPriority;
  progress: number;
  slaDueDate: string | null;
  budget: number;
  estimatedCost: number;
  actualCost: number;
  active: boolean;
};

export async function createProjectAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateProjectBackend("/api/projects", "POST", projectPayloadFromForm(formData));
    revalidatePath("/projects");
  }, "Nao foi possivel salvar o projeto");
}

export async function updateProjectAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateProjectBackend(
      `/api/projects/${encodeURIComponent(id)}`,
      "PUT",
      projectPayloadFromForm(formData)
    );
    revalidatePath("/projects");
  }, "Nao foi possivel salvar o projeto");
}

export async function updateProjectStatusAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    const status = requiredString(formData.get("status")) as ProjectStatus;
    const progress = nullableNumber(formData.get("progress"));
    await mutateProjectBackend(`/api/projects/${encodeURIComponent(id)}/status`, "PATCH", {
      status,
      progress
    });
    revalidatePath("/projects");
  }, "Nao foi possivel atualizar o status do projeto");
}

export async function deleteProjectAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateProjectBackend(`/api/projects/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/projects");
  }, "Nao foi possivel excluir o projeto");
}

function projectPayloadFromForm(formData: FormData): ProjectPayload {
  return {
    clientId: requiredString(formData.get("clientId")),
    contractId: nullableString(formData.get("contractId")),
    serviceId: nullableString(formData.get("serviceId")),
    name: requiredString(formData.get("name")),
    description: stringFromForm(formData.get("description")),
    status: requiredString(formData.get("status")) as ProjectStatus,
    responsibleUserId: nullableString(formData.get("responsibleUserId")),
    teamMemberIds: stringFromForm(formData.get("teamMemberIds")),
    startDate: nullableString(formData.get("startDate")),
    priority: requiredString(formData.get("priority")) as ProjectPriority,
    progress: clamp(numberFromForm(formData.get("progress")), 0, 100),
    slaDueDate: nullableString(formData.get("slaDueDate")),
    budget: numberFromForm(formData.get("budget")),
    estimatedCost: numberFromForm(formData.get("estimatedCost")),
    actualCost: numberFromForm(formData.get("actualCost")),
    active: formData.get("active") !== "false"
  };
}

async function mutateProjectBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar o projeto");
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

function nullableNumber(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  return normalizedValue ? numberFromForm(normalizedValue) : null;
}

function numberFromForm(value: FormDataEntryValue | null) {
  return numberFromFormValue(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
