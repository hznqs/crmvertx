import { fetchBackendPage } from "@/lib/api/backend";
import { toAuditSearchParams } from "@/lib/audit/query";
import type { AuditLog, AuditPage, AuditQuery } from "@/lib/types/audit";

export async function fetchAuditLogs(query: AuditQuery): Promise<AuditPage> {
  return fetchBackendPage<AuditLog>("/api/audit", toAuditSearchParams(query));
}
