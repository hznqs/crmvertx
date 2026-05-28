import { fetchBackendJson } from "@/lib/api/backend";
import type { CrmSettings, Organization } from "@/lib/types/settings";

export async function fetchCrmSettings() {
  return fetchBackendJson<CrmSettings>("/api/settings");
}

export async function fetchOrganization() {
  return fetchBackendJson<Organization>("/api/organization");
}
