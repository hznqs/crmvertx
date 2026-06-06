"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import type {
  ClientType,
  ClientPriority,
  ClientStatus,
  DocumentType
} from "@/lib/types/clients";

type ClientPayload = {
  name: string;
  phase: string;
  contact: string;
  email: string;
  phone: string;
  document: string;
  clientType: ClientType;
  documentType: DocumentType | null;
  segment: string;
  origin: string;
  responsibleName: string;
  status: ClientStatus;
  priority: ClientPriority;
  tags: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string | null;
  addressZipCode: string;
  convertedFromLeadId: string | null;
  notes: string;
};

export async function createClientAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateClientBackend("/api/clients", "POST", clientPayloadFromForm(formData));
    revalidatePath("/clients");
  }, "Nao foi possivel salvar o cliente");
}

export async function updateClientAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateClientBackend(
      `/api/clients/${encodeURIComponent(id)}`,
      "PUT",
      clientPayloadFromForm(formData)
    );
    revalidatePath("/clients");
  }, "Nao foi possivel salvar o cliente");
}

export async function updateClientPhaseAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    const phase = requiredString(formData.get("phase"));

    await mutateClientBackend(`/api/clients/${encodeURIComponent(id)}/phase`, "PATCH", {
      phase
    });
    revalidatePath("/clients");
  }, "Nao foi possivel atualizar a fase do cliente");
}

export async function deleteClientAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateClientBackend(`/api/clients/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/clients");
  }, "Nao foi possivel excluir o cliente");
}

function clientPayloadFromForm(formData: FormData): ClientPayload {
  return {
    name: requiredString(formData.get("name")),
    phase: requiredString(formData.get("phase")),
    contact: requiredString(formData.get("contact")),
    email: stringFromForm(formData.get("email")),
    phone: stringFromForm(formData.get("phone")),
    document: stringFromForm(formData.get("document")),
    clientType: requiredString(formData.get("clientType")) as ClientType,
    documentType: (nullableString(formData.get("documentType")) ?? "NAO_INFORMADO") as DocumentType,
    segment: stringFromForm(formData.get("segment")),
    origin: stringFromForm(formData.get("origin")),
    responsibleName: stringFromForm(formData.get("responsibleName")),
    status: requiredString(formData.get("status")) as ClientStatus,
    priority: requiredString(formData.get("priority")) as ClientPriority,
    tags: stringFromForm(formData.get("tags")),
    addressStreet: stringFromForm(formData.get("addressStreet")),
    addressNumber: stringFromForm(formData.get("addressNumber")),
    addressComplement: stringFromForm(formData.get("addressComplement")),
    addressDistrict: stringFromForm(formData.get("addressDistrict")),
    addressCity: stringFromForm(formData.get("addressCity")),
    addressState: nullableString(formData.get("addressState"))?.toUpperCase() ?? null,
    addressZipCode: stringFromForm(formData.get("addressZipCode")),
    convertedFromLeadId: null,
    notes: stringFromForm(formData.get("notes"))
  };
}

async function mutateClientBackend(
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
    throw new Error(error?.message ?? "Nao foi possivel salvar o cliente");
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
