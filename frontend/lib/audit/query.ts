import type { AuditQuery } from "@/lib/types/audit";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toAuditSearchParams(query: AuditQuery) {
  const params = new URLSearchParams();

  if (uuidPattern.test(query.userId)) {
    params.set("userId", query.userId);
  }

  setTextParam(params, "action", query.action);
  setTextParam(params, "entity", query.entity);
  setInstantParam(params, "from", query.from, "start");
  setInstantParam(params, "to", query.to, "end");
  params.set("page", String(query.page));
  params.set("size", String(query.size));
  params.set("sort", "createdAt,desc");

  return params;
}

function setTextParam(params: URLSearchParams, key: string, value: string) {
  const normalizedValue = value.trim();
  if (normalizedValue) {
    params.set(key, normalizedValue);
  }
}

function setInstantParam(
  params: URLSearchParams,
  key: "from" | "to",
  dateValue: string,
  boundary: "start" | "end"
) {
  if (!dateValue) {
    return;
  }

  const time = boundary === "start" ? "00:00:00" : "23:59:59";
  params.set(key, new Date(`${dateValue}T${time}-03:00`).toISOString());
}
