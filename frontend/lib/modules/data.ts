import { fetchBackendJson, fetchBackendPage } from "@/lib/api/backend";
import type { BackendPage } from "@/lib/api/backend";
import type { ModuleDefinition } from "@/lib/modules/registry";

export async function fetchModuleData(
  moduleDefinition: ModuleDefinition,
  searchParams: Record<string, string | undefined>
): Promise<BackendPage<Record<string, unknown>>> {
  const params = new URLSearchParams();
  params.set("page", searchParams.page ?? "0");
  params.set("size", searchParams.size ?? "25");

  if (searchParams.search) {
    params.set("search", searchParams.search);
  }

  if (moduleDefinition.endpoint.endsWith("/summary") || moduleDefinition.endpoint.endsWith("/metrics")) {
    const data = await fetchBackendJson<Record<string, unknown>>(moduleDefinition.endpoint);
    if (!data) {
      return {
        content: [],
        number: 0,
        size: 25,
        totalPages: 1,
        totalElements: 0,
        sourceUnavailable: true
      };
    }

    return {
      content: [data],
      number: 0,
      size: 1,
      totalPages: 1,
      totalElements: 1
    };
  }

  return fetchBackendPage(moduleDefinition.endpoint, params);
}
