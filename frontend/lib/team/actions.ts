"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";

type TeamMemberPayload = {
  userId: string | null;
  name: string;
  role: string;
  functionName: string;
  joinedAt: string | null;
  email: string;
  phone: string;
  tasks: number;
  completed: number;
  performance: number;
  notes: string;
  taskBreakdown: string;
  hourlyCost: number;
  capacityHoursMonth: number;
  active: boolean;
};

export async function createTeamMemberAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateTeamBackend("/api/team-members", "POST", teamPayloadFromForm(formData));
    revalidatePath("/team");
  }, "Nao foi possivel salvar o membro da equipe");
}

export async function updateTeamMemberAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateTeamBackend(`/api/team-members/${encodeURIComponent(id)}`, "PUT", teamPayloadFromForm(formData));
    revalidatePath("/team");
  }, "Nao foi possivel salvar o membro da equipe");
}

export async function deleteTeamMemberAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateTeamBackend(`/api/team-members/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/team");
  }, "Nao foi possivel excluir o membro da equipe");
}

function teamPayloadFromForm(formData: FormData): TeamMemberPayload {
  return {
    userId: nullableString(formData.get("userId")),
    name: requiredString(formData.get("name")),
    role: requiredString(formData.get("role")),
    functionName: stringFromForm(formData.get("functionName")),
    joinedAt: nullableString(formData.get("joinedAt")),
    email: stringFromForm(formData.get("email")),
    phone: stringFromForm(formData.get("phone")),
    tasks: numberFromForm(formData.get("tasks")),
    completed: numberFromForm(formData.get("completed")),
    performance: numberFromForm(formData.get("performance")),
    notes: stringFromForm(formData.get("notes")),
    taskBreakdown: stringFromForm(formData.get("taskBreakdown")),
    hourlyCost: numberFromForm(formData.get("hourlyCost")),
    capacityHoursMonth: Math.max(1, numberFromForm(formData.get("capacityHoursMonth")) || 160),
    active: formData.get("active") !== "false"
  };
}

async function mutateTeamBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar o membro da equipe");
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
