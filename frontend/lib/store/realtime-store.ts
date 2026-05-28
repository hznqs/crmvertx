"use client";

import { create } from "zustand";
import type { RealtimeEvent } from "@/lib/realtime/types";

type RealtimeState = {
  connected: boolean;
  onlineUsers: number;
  events: RealtimeEvent[];
  setConnected: (connected: boolean) => void;
  addEvent: (event: RealtimeEvent) => void;
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  onlineUsers: 0,
  events: [],
  setConnected: (connected) => set({ connected }),
  addEvent: (event) =>
    set((state) => {
      const onlineUsers = onlineUsersFromEvent(event) ?? state.onlineUsers;

      if (event.channel === "presence") {
        return { onlineUsers };
      }

      return {
        onlineUsers,
        events: [event, ...state.events.filter((current) => current.id !== event.id)].slice(0, 80)
      };
    })
}));

function onlineUsersFromEvent(event: RealtimeEvent) {
  const value = event.payload.onlineUsers;
  return typeof value === "number" ? value : null;
}
