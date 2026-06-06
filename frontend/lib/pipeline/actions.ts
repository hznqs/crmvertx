"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import type { CommercialStage } from "@/lib/types/leads";

export async function updatePipelineLeadStageAction(
  leadId: string,
  commercialStage: CommercialStage,
  lostReason = ""
): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
    const cookieStore = await cookies();
    const token = cookieStore.get("crm_access_token")?.value;

    const response = await fetch(`${apiBaseUrl}/api/leads/${encodeURIComponent(leadId)}/stage`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        commercialStage,
        lostReason
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "Nao foi possivel atualizar a fase do lead");
    }

    revalidatePath("/pipeline");
    revalidatePath("/leads");
    revalidatePath("/clients");
    revalidatePath("/contracts");
  }, "Nao foi possivel atualizar a fase do lead");
}
