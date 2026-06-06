"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session-cookies";

const CLEANUP_CONFIRMATION = "LIMPAR_DADOS_DO_CRM";
const REVALIDATE_PATHS = [
  "/dashboard",
  "/analytics",
  "/leads",
  "/pipeline",
  "/clients",
  "/contracts",
  "/services",
  "/projects",
  "/deliveries",
  "/tasks",
  "/calendar",
  "/billing",
  "/finance",
  "/commissions",
  "/goals",
  "/team",
  "/settings"
];

export async function cleanupCrmAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const mode = requiredString(formData.get("mode"));
    const confirmation = requiredString(formData.get("confirmation"));

    if (confirmation !== CLEANUP_CONFIRMATION) {
      throw new Error("Confirmacao invalida. Digite LIMPAR_DADOS_DO_CRM para executar a limpeza.");
    }

    await mutateCleanupBackend({ mode, confirmation });
    REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
  }, "Nao foi possivel limpar os dados do CRM.");
}

async function mutateCleanupBackend(payload: { mode: string; confirmation: string }) {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const response = await fetch(`${apiBaseUrl}/api/admin/cleanup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await backendErrorMessage(response, "Nao foi possivel limpar os dados do CRM."));
  }
}

function requiredString(value: FormDataEntryValue | null) {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    throw new Error("Campo obrigatorio ausente.");
  }
  return normalizedValue;
}
