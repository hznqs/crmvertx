"use client";

import { motion } from "framer-motion";
import { Activity, CircleDot, LogIn, Radio, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AuditLog } from "@/lib/types/audit";
import type { RealtimeEvent } from "@/lib/realtime/types";
import { useRealtimeStore } from "@/lib/store/realtime-store";

type ActivityFeedProps = {
  initialLogs: AuditLog[];
};

export function ActivityFeed({ initialLogs }: ActivityFeedProps) {
  const realtimeEvents = useRealtimeStore((state) => state.events);
  const connected = useRealtimeStore((state) => state.connected);
  const onlineUsers = useRealtimeStore((state) => state.onlineUsers);
  const items = mergeActivity(initialLogs, realtimeEvents);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-xl border border-line bg-panel/95 p-4 shadow-panel md:p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Timeline operacional</h2>
            <p className="mt-1 text-sm text-muted">Eventos de atividade, autenticacao, alteracoes e sistema em ordem cronologica.</p>
          </div>
          <Badge variant={connected ? "success" : "warning"}>
            <Radio className="mr-1 h-3 w-3" aria-hidden />
            {connected ? "Realtime ativo" : "Reconectando"}
          </Badge>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(index * 0.015, 0.12) }}
              className="grid gap-3 rounded-xl border border-line bg-white/[0.025] p-4 md:grid-cols-[36px_1fr_auto]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/[0.045] text-brand-400">
                <ActivityIcon item={item} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <Badge variant={item.tone}>{item.action}</Badge>
                </div>
                <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                  {item.userId ? <span>Usuario {shortId(item.userId)}</span> : null}
                  {item.entityId ? <span>Registro {shortId(item.entityId)}</span> : null}
                  {item.ipAddress ? <span>IP {item.ipAddress}</span> : null}
                </div>
              </div>
              <time className="text-xs font-semibold text-zinc-500">{relativeTime(item.createdAt)}</time>
            </motion.article>
          ))}
        </div>
      </div>

      <aside className="space-y-5">
        <section className="rounded-xl border border-line bg-panel/95 p-5 shadow-panel">
          <p className="text-sm font-bold text-white">Presenca</p>
          <p className="mt-4 text-4xl font-black tracking-tight text-white">{onlineUsers}</p>
          <p className="mt-2 text-sm text-muted">usuarios online nesta instancia realtime</p>
        </section>
        <section className="rounded-xl border border-line bg-panel/95 p-5 shadow-panel">
          <p className="text-sm font-bold text-white">Canais ativos</p>
          <div className="mt-4 grid gap-2">
            <Channel label="activity" value="Atividades e mudancas" />
            <Channel label="presence" value="Usuarios online/offline" />
            <Channel label="system" value="Eventos operacionais" />
          </div>
        </section>
      </aside>
    </section>
  );
}

type FeedItem = {
  id: string;
  action: string;
  title: string;
  description: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  ipAddress: string | null;
  createdAt: string;
  tone: "neutral" | "brand" | "success" | "warning" | "danger";
};

function mergeActivity(logs: AuditLog[], events: RealtimeEvent[]): FeedItem[] {
  const fromLogs = logs.map(logToFeedItem);
  const fromEvents = events
    .filter((event) => event.channel === "activity" || event.type.startsWith("auth."))
    .map(eventToFeedItem);
  const seen = new Set<string>();

  return [...fromEvents, ...fromLogs]
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 80);
}

function logToFeedItem(log: AuditLog): FeedItem {
  return {
    id: log.id,
    action: log.action,
    title: `${log.entity} ${actionLabel(log.action)}`,
    description: descriptionFromValues(log.fieldName, log.oldValue, log.newValue, log.metadata),
    entity: log.entity,
    entityId: log.entityId,
    userId: log.userId,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt,
    tone: toneFromAction(log.action)
  };
}

function eventToFeedItem(event: RealtimeEvent): FeedItem {
  return {
    id: String(event.payload.auditId ?? event.id),
    action: event.action ?? event.type,
    title: `${event.entity ?? "Sistema"} ${actionLabel(event.action ?? event.type)}`,
    description: descriptionFromValues(
      textPayload(event, "fieldName"),
      textPayload(event, "oldValue"),
      textPayload(event, "newValue"),
      textPayload(event, "metadata")
    ),
    entity: event.entity ?? "Sistema",
    entityId: event.entityId,
    userId: event.userId,
    ipAddress: null,
    createdAt: textPayload(event, "createdAt") || event.occurredAt,
    tone: toneFromAction(event.action ?? event.type)
  };
}

function ActivityIcon({ item }: { item: FeedItem }) {
  if (item.entity === "Authentication") {
    return <LogIn className="h-4 w-4" aria-hidden />;
  }
  if (item.action.includes("UPDATE")) {
    return <CircleDot className="h-4 w-4" aria-hidden />;
  }
  if (item.action.includes("DELETE")) {
    return <ShieldCheck className="h-4 w-4" aria-hidden />;
  }
  return <UserRound className="h-4 w-4" aria-hidden />;
}

function Channel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.025] p-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-400">{label}</p>
      <p className="mt-1 text-sm text-muted">{value}</p>
    </div>
  );
}

function textPayload(event: RealtimeEvent, key: string) {
  const value = event.payload[key];
  return typeof value === "string" ? value : "";
}

function descriptionFromValues(fieldName: string | null, oldValue: string | null, newValue: string | null, metadata: string | null) {
  if (fieldName) {
    return `${fieldName}: ${oldValue || "-"} -> ${newValue || "-"}`;
  }
  if (metadata) {
    return metadata;
  }
  return "Evento registrado na trilha de atividades.";
}

function actionLabel(action: string) {
  return action.toLowerCase().replaceAll("_", " ");
}

function toneFromAction(action: string): FeedItem["tone"] {
  if (action.includes("FAILURE") || action.includes("BLOCKED") || action.includes("DELETE")) return "danger";
  if (action.includes("LOGIN") || action.includes("CREATE")) return "success";
  if (action.includes("UPDATE") || action.includes("REFRESH")) return "brand";
  if (action.includes("LOGOUT")) return "warning";
  return "neutral";
}

function shortId(value: string) {
  return value.slice(0, 8);
}

function relativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(Math.round(diffMs / 60_000), 0);
  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
}
