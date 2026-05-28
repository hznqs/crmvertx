"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type BoardDensity = "comfortable" | "compact";

type KanbanState = {
  density: BoardDensity;
  collapsedColumns: Record<string, boolean>;
  setDensity: (density: BoardDensity) => void;
  toggleColumn: (columnId: string) => void;
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      density: "comfortable",
      collapsedColumns: {},
      setDensity: (density) => set({ density }),
      toggleColumn: (columnId) =>
        set((state) => ({
          collapsedColumns: {
            ...state.collapsedColumns,
            [columnId]: !state.collapsedColumns[columnId]
          }
        }))
    }),
    {
      name: "crm-kanban-preferences"
    }
  )
);
