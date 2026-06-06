"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type { CommissionCalculationType, CommissionStatus, CommissionType } from "@/lib/types/commissions";

type CommissionPayload = {
  memberId: string;
  type: CommissionType;
  status: CommissionStatus;
  contractId: string | null;
  financeEntryId: string | null;
  clientId: string | null;
  client: string;
  calculationType: CommissionCalculationType;
  value: number;
  percent: number;
  fixedValue: number;
  referenceMonth: string | null;
  goal: number;
  active: boolean;
};

export async function createCommissionAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateCommissionBackend("/api/commission-sales", "POST", commissionPayloadFromForm(formData));
    revalidatePath("/commissions");
  }, "Nao foi possivel salvar a comissao");
}

export async function updateCommissionAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateCommissionBackend(`/api/commission-sales/${encodeURIComponent(id)}`, "PUT", commissionPayloadFromForm(formData));
    revalidatePath("/commissions");
  }, "Nao foi possivel salvar a comissao");
}

export async function deleteCommissionAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateCommissionBackend(`/api/commission-sales/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/commissions");
  }, "Nao foi possivel excluir a comissao");
}

function commissionPayloadFromForm(formData: FormData): CommissionPayload {
  return {
    memberId: requiredString(formData.get("memberId")),
    type: requiredString(formData.get("type")) as CommissionType,
    status: requiredString(formData.get("status")) as CommissionStatus,
    contractId: nullableString(formData.get("contractId")),
    financeEntryId: nullableString(formData.get("financeEntryId")),
    clientId: nullableString(formData.get("clientId")),
    client: stringFromForm(formData.get("client")),
    calculationType: requiredString(formData.get("calculationType")) as CommissionCalculationType,
    value: numberFromForm(formData.get("value")),
    percent: numberFromForm(formData.get("percent")),
    fixedValue: numberFromForm(formData.get("fixedValue")),
    referenceMonth: nullableString(formData.get("referenceMonth")),
    goal: numberFromForm(formData.get("goal")),
    active: formData.get("active") !== "false"
  };
}

async function mutateCommissionBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar a comissao");
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
  return numberFromFormValue(value);
}
