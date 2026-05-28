"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { ChevronDown, GripVertical } from "lucide-react";
import { useRef, useState } from "react";
import { useKanbanStore } from "@/lib/store/kanban-store";
import { cn } from "@/lib/utils";

export type EnterpriseKanbanColumn<TColumnId extends string, TCard> = {
  id: TColumnId;
  title: string;
  description: string;
  accentClassName: string;
  cards: TCard[];
  totalValue?: string;
};

type EnterpriseKanbanProps<TColumnId extends string, TCard extends { id: string }> = {
  columns: EnterpriseKanbanColumn<TColumnId, TCard>[];
  getCardId: (card: TCard) => string;
  renderCard: (card: TCard, meta: { dragging: boolean }) => React.ReactNode;
  onMove: (cardId: string, targetColumnId: TColumnId) => void;
  emptyLabel: string;
  estimateCardSize?: number;
};

export function EnterpriseKanban<TColumnId extends string, TCard extends { id: string }>({
  columns,
  getCardId,
  renderCard,
  onMove,
  emptyLabel,
  estimateCardSize = 214
}: EnterpriseKanbanProps<TColumnId, TCard>) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const density = useKanbanStore((state) => state.density);
  const setDensity = useKanbanStore((state) => state.setDensity);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-[#090909]/90 p-3 shadow-[0_0_0_1px_rgba(234,89,220,.08),0_24px_70px_rgba(0,0,0,.42)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-400">Board enterprise</p>
          <p className="mt-1 text-sm text-muted">Drag and drop com optimistic UI, colunas persistentes e virtualizacao por coluna.</p>
        </div>
        <div className="inline-flex rounded-lg border border-line bg-white/[0.035] p-1">
          {(["comfortable", "compact"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDensity(value)}
              className={cn(
                "rounded-md px-3 py-2 text-xs font-bold transition",
                density === value ? "bg-brand-600 text-white shadow-[0_0_24px_rgba(234,89,220,.22)]" : "text-zinc-400 hover:text-white"
              )}
            >
              {value === "comfortable" ? "Conforto" : "Compacto"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[1480px] auto-cols-[minmax(230px,1fr)] grid-flow-col gap-4">
          {columns.map((column) => (
            <VirtualKanbanColumn
              key={column.id}
              column={column}
              draggedCardId={draggedCardId}
              estimateCardSize={density === "compact" ? Math.round(estimateCardSize * 0.76) : estimateCardSize}
              getCardId={getCardId}
              renderCard={renderCard}
              setDraggedCardId={setDraggedCardId}
              onMove={onMove}
              emptyLabel={emptyLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VirtualKanbanColumn<TColumnId extends string, TCard extends { id: string }>({
  column,
  draggedCardId,
  estimateCardSize,
  getCardId,
  renderCard,
  setDraggedCardId,
  onMove,
  emptyLabel
}: {
  column: EnterpriseKanbanColumn<TColumnId, TCard>;
  draggedCardId: string | null;
  estimateCardSize: number;
  getCardId: (card: TCard) => string;
  renderCard: (card: TCard, meta: { dragging: boolean }) => React.ReactNode;
  setDraggedCardId: (id: string | null) => void;
  onMove: (cardId: string, targetColumnId: TColumnId) => void;
  emptyLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const collapsed = useKanbanStore((state) => state.collapsedColumns[column.id]);
  const toggleColumn = useKanbanStore((state) => state.toggleColumn);
  const cards = column.cards;
  // TanStack Virtual exposes imperative helpers; React Compiler should not memoize this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateCardSize,
    overscan: 8
  });
  const virtualCards = virtualizer.getVirtualItems();

  function handleDrop() {
    if (!draggedCardId) {
      return;
    }
    onMove(draggedCardId, column.id);
    setDraggedCardId(null);
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "rounded-2xl border border-line bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,.04)]",
        "transition hover:border-brand-500/25 hover:shadow-[0_0_34px_rgba(106,13,173,.16)]"
      )}
    >
      <header className="sticky top-0 z-20 rounded-t-2xl border-b border-line bg-[#090909]/95 p-3 backdrop-blur-xl">
        <div className={cn("mb-3 h-1 rounded-full", column.accentClassName)} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-white">{column.title}</h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{column.description}</p>
          </div>
          <button
            type="button"
            onClick={() => toggleColumn(column.id)}
            className="rounded-lg border border-line bg-white/[0.045] p-2 text-zinc-400 transition hover:border-brand-500/40 hover:text-white"
            aria-label={`Alternar coluna ${column.title}`}
          >
            <ChevronDown className={cn("h-4 w-4 transition", collapsed && "-rotate-90")} aria-hidden />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 font-black text-zinc-200">{cards.length} cards</span>
          {column.totalValue ? <span className="font-bold text-brand-400">{column.totalValue}</span> : null}
        </div>
      </header>

      {collapsed ? null : (
        <div ref={scrollRef} className="h-[68vh] min-h-[560px] overflow-y-auto p-3 calendar-scrollbar">
          {cards.length === 0 ? (
            <div className="grid h-40 place-items-center rounded-xl border border-dashed border-line bg-white/[0.025] px-4 text-center text-sm text-muted">
              {emptyLabel}
            </div>
          ) : (
            <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualCards.map((virtualCard) => {
                const card = cards[virtualCard.index];
                const cardId = getCardId(card);
                return (
                  <motion.article
                    key={virtualCard.key}
                    draggable
                    onDragStart={() => setDraggedCardId(cardId)}
                    onDragEnd={() => setDraggedCardId(null)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: draggedCardId === cardId ? 0.55 : 1, y: 0 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute left-0 top-0 w-full cursor-grab active:cursor-grabbing"
                    style={{
                      height: `${virtualCard.size}px`,
                      top: `${virtualCard.start}px`
                    }}
                  >
                    <div className="pb-3">
                      <div className="group relative rounded-2xl border border-line bg-[#111014]/95 p-4 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[0_0_44px_rgba(234,89,220,.13)]">
                        <GripVertical className="absolute right-3 top-3 h-4 w-4 text-zinc-600 opacity-0 transition group-hover:opacity-100" aria-hidden />
                        {renderCard(card, { dragging: draggedCardId === cardId })}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
