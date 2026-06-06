"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FloatingLayer } from "@/components/ui/floating-layer";
import { cn } from "@/lib/utils";

type MonthPickerProps = Readonly<{
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}>;

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function MonthPicker({
  name,
  value,
  defaultValue = "",
  onChange,
  required,
  disabled,
  placeholder = "Selecionar mes",
  className,
  ariaLabel = "Selecionar mes"
}: MonthPickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selectedMonth = parseMonth(selectedValue);
  const [open, setOpen] = useState(false);
  const [visibleYear, setVisibleYear] = useState(() => selectedMonth?.getFullYear() ?? new Date().getFullYear());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ left: 16, top: 16, width: 288, maxHeight: 280 });
  const currentMonthKey = useMemo(() => toMonthKey(new Date()), []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const margin = 12;
      const gap = 8;
      const width = Math.min(288, window.innerWidth - margin * 2);
      const estimatedHeight = 248;
      const rect = trigger.getBoundingClientRect();
      const preferredLeft = rect.right - width;
      const left = clamp(preferredLeft, margin, window.innerWidth - width - margin);
      const availableBelow = Math.max(0, window.innerHeight - rect.bottom - gap - margin);
      const availableAbove = Math.max(0, rect.top - gap - margin);
      const openBelow = availableBelow >= estimatedHeight || availableBelow >= availableAbove;
      const availableHeight = openBelow ? availableBelow : availableAbove;
      const maxHeight = Math.min(estimatedHeight, Math.max(220, availableHeight));
      const top = openBelow
        ? rect.bottom + gap
        : clamp(rect.top - maxHeight - gap, margin, window.innerHeight - maxHeight - margin);

      setPosition({ left, top, width, maxHeight });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  function commit(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      {name ? <input type="hidden" name={name} value={selectedValue} required={required} /> : null}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn("crm-control group flex w-full items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-55", open && "border-brand-400 shadow-focus")}
      >
        <span className={cn("min-w-0 truncate", selectedMonth ? "font-semibold text-white" : "text-zinc-500")}>
          {selectedMonth ? formatMonth(selectedMonth) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 text-brand-400 transition group-hover:scale-110" aria-hidden />
      </button>

      <FloatingLayer>
        <AnimatePresence>
          {open ? (
            <>
              <button
                type="button"
                aria-label="Fechar seletor de mes"
                className="fixed inset-0 z-40 cursor-default bg-transparent"
                onClick={() => setOpen(false)}
              />
              <motion.div
              role="dialog"
              aria-label={ariaLabel}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="crm-popover-surface fixed z-50 overflow-visible p-2.5"
              style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button type="button" onClick={() => setVisibleYear((year) => year - 1)} className="grid h-8 w-8 place-items-center rounded-crm border border-line bg-white/[0.045] text-zinc-300 transition duration-premium ease-premium hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus" aria-label="Ano anterior">
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                </button>
                <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-black text-white">{visibleYear}</p>
                <button type="button" onClick={() => setVisibleYear((year) => year + 1)} className="grid h-8 w-8 place-items-center rounded-crm border border-line bg-white/[0.045] text-zinc-300 transition duration-premium ease-premium hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus" aria-label="Proximo ano">
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {monthLabels.map((label, index) => {
                  const monthKey = `${visibleYear}-${String(index + 1).padStart(2, "0")}`;
                  const selected = monthKey === selectedValue;
                  const current = monthKey === currentMonthKey;
                  return (
                    <button
                      key={monthKey}
                      type="button"
                      onClick={() => commit(monthKey)}
                      className={cn(
                        "h-8 rounded-crm px-2 text-[13px] font-black text-zinc-300 transition duration-premium ease-premium hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus",
                        current && "ring-1 ring-brand-400/25",
                        selected && "bg-brand-600 text-white shadow-[0_0_26px_rgba(234,89,220,.18)]"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-line pt-2">
                <button type="button" onClick={() => commit(currentMonthKey)} className="rounded-crm px-2.5 py-1.5 text-center text-xs font-bold text-zinc-300 transition duration-premium ease-premium hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus">Mes atual</button>
                <button type="button" onClick={() => commit("")} className="rounded-crm px-2.5 py-1.5 text-center text-xs font-bold text-zinc-300 transition duration-premium ease-premium hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus">Limpar</button>
              </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </FloatingLayer>
    </div>
  );
}

function parseMonth(value: string) {
  if (!value) return null;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
