"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { isRealtimeEvent, type RealtimeEvent } from "@/lib/realtime/types";
import { useRealtimeStore } from "@/lib/store/realtime-store";

const invalidateByEntity: Record<string, string[]> = {
  Authentication: ["audit"],
  Cliente: ["audit", "clients", "dashboard", "billing"],
  Lead: ["audit", "leads", "dashboard"],
  Task: ["audit", "tasks", "dashboard"],
  Project: ["audit", "projects", "dashboard"],
  Contrato: ["audit", "contracts", "dashboard", "billing"],
  "Lancamento financeiro": ["audit", "finance", "dashboard", "billing"],
  Entrega: ["audit", "deliveries", "dashboard"],
  Documento: ["audit", "uploads"],
  ServiceOffering: ["audit", "services"],
  Comissao: ["audit", "commissions", "dashboard"],
  Meta: ["audit", "goals", "dashboard"],
  Performance: ["audit", "performance", "dashboard"],
  "Membro da equipe": ["audit", "team", "dashboard"]
};

const defaultActivityKeys = ["audit"];
const invalidationDelayMs = 350;

export function RealtimeBridge() {
  const queryClient = useQueryClient();
  const addEvent = useRealtimeStore((state) => state.addEvent);
  const setConnected = useRealtimeStore((state) => state.setConnected);
  const pendingInvalidations = useRef(new Set<string>());
  const invalidationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/realtime/stream");

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    eventSource.addEventListener("realtime.event", (message) => handleEvent(message.data));

    function handleEvent(rawData: string) {
      const event = parseEvent(rawData);
      if (!event) {
        return;
      }

      addEvent(event);
      invalidateQueries(event);
      notify(event);
    }

    function invalidateQueries(event: RealtimeEvent) {
      if (event.channel === "presence") {
        return;
      }

      const keys = event.channel === "activity"
        ? keysForActivity(event)
        : [event.channel];

      keys.forEach((key) => {
        pendingInvalidations.current.add(key);
      });

      scheduleInvalidationFlush();
    }

    function scheduleInvalidationFlush() {
      if (invalidationTimer.current) {
        return;
      }

      invalidationTimer.current = setTimeout(() => {
        const keys = Array.from(pendingInvalidations.current);
        pendingInvalidations.current.clear();
        invalidationTimer.current = null;

        keys.forEach((key) => {
          void queryClient.invalidateQueries({ queryKey: [key] });
        });
      }, invalidationDelayMs);
    }

    return () => {
      if (invalidationTimer.current) {
        clearTimeout(invalidationTimer.current);
      }
      eventSource.close();
      setConnected(false);
    };
  }, [addEvent, queryClient, setConnected]);

  return null;
}

function parseEvent(rawData: string) {
  try {
    const parsed = JSON.parse(rawData) as unknown;
    return isRealtimeEvent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function notify(event: RealtimeEvent) {
  if (event.channel === "presence") {
    return;
  }

  if (event.type.startsWith("auth.")) {
    toast.info(activityTitle(event), { description: activityDescription(event) });
    return;
  }

  toast.success(activityTitle(event), { description: activityDescription(event) });
}

function activityTitle(event: RealtimeEvent) {
  const entity = event.entity ?? "Sistema";
  const action = event.action ?? event.type;
  return `${entity}: ${action}`;
}

function activityDescription(event: RealtimeEvent) {
  const fieldName = event.payload.fieldName;
  if (typeof fieldName === "string" && fieldName) {
    return `Campo alterado: ${fieldName}`;
  }
  return "Evento sincronizado em tempo real.";
}

function keysForActivity(event: RealtimeEvent) {
  if (event.type.startsWith("auth.")) {
    return invalidateByEntity.Authentication;
  }

  return event.entity ? (invalidateByEntity[event.entity] ?? defaultActivityKeys) : defaultActivityKeys;
}
