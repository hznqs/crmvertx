export type RealtimeEvent = {
  id: string;
  type: string;
  channel: string;
  userId: string | null;
  tenantId: string | null;
  entity: string | null;
  entityId: string | null;
  action: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
};

export function isRealtimeEvent(value: unknown): value is RealtimeEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RealtimeEvent>;
  return typeof candidate.id === "string"
    && typeof candidate.type === "string"
    && typeof candidate.channel === "string"
    && typeof candidate.occurredAt === "string";
}
