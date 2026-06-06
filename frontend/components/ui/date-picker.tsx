"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FloatingLayer } from "@/components/ui/floating-layer";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

export function DatePicker({
  name,
  value,
  defaultValue = "",
  onChange,
  required,
  disabled,
  placeholder = "Selecionar data",
  className
}: DatePickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selectedDate = parseDate(selectedValue);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ left: 16, top: 16, width: 304, maxHeight: 340 });
  const days = useMemo(() => calendarDays(visibleMonth), [visibleMonth]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const margin = 12;
      const gap = 8;
      const popoverWidth = Math.min(304, window.innerWidth - margin * 2);
      const estimatedPopoverHeight = 324;
      const rect = trigger.getBoundingClientRect();
      const preferredLeft = rect.right - popoverWidth;
      const left = clamp(preferredLeft, margin, window.innerWidth - popoverWidth - margin);
      const availableBelow = Math.max(0, window.innerHeight - rect.bottom - gap - margin);
      const availableAbove = Math.max(0, rect.top - gap - margin);
      const openBelow = availableBelow >= estimatedPopoverHeight || availableBelow >= availableAbove;
      const availableHeight = openBelow ? availableBelow : availableAbove;
      const popoverHeight = Math.min(estimatedPopoverHeight, Math.max(260, availableHeight));
      const top = openBelow
        ? rect.bottom + gap
        : clamp(rect.top - popoverHeight - gap, margin, window.innerHeight - popoverHeight - margin);

      setPopoverPosition({ left, top, width: popoverWidth, maxHeight: popoverHeight });
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
      {name ? (
        <input
          name={name}
          value={selectedValue}
          required={required}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "crm-control group flex w-full items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-55"
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={selectedValue ? "font-semibold text-white" : "text-zinc-500"}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 text-brand-400 transition group-hover:scale-110" aria-hidden />
      </button>

      <FloatingLayer>
        <AnimatePresence>
          {open ? (
            <>
              <button
                type="button"
                aria-label="Fechar calendario"
                className="fixed inset-0 z-40 cursor-default bg-transparent"
                onClick={() => setOpen(false)}
              />
              <motion.div
              role="dialog"
              aria-label="Selecionar data"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="crm-popover-surface fixed z-50 overflow-visible p-2.5"
              style={{ left: popoverPosition.left, top: popoverPosition.top, width: popoverPosition.width, maxHeight: popoverPosition.maxHeight }}
            >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button type="button" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))} className="grid h-8 w-8 place-items-center rounded-crm border border-line bg-white/[0.045] text-zinc-300 transition duration-premium ease-premium hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus" aria-label="Mes anterior">
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              </button>
              <p className="min-w-0 truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-center text-sm font-black capitalize text-white">
                {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(visibleMonth)}
              </p>
              <button type="button" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))} className="grid h-8 w-8 place-items-center rounded-crm border border-line bg-white/[0.045] text-zinc-300 transition duration-premium ease-premium hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus" aria-label="Proximo mes">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-zinc-600">
              {weekDays.map((day, index) => <span key={`${day}-${index}`} className="py-1">{day}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const iso = toIsoDate(day.date);
                const selected = iso === selectedValue;
                const today = iso === toIsoDate(new Date());
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => commit(iso)}
                    className={cn(
                      "grid h-8 place-items-center rounded-crm text-[13px] font-bold transition duration-premium ease-premium focus-visible:shadow-focus",
                      day.currentMonth ? "text-zinc-200" : "text-zinc-700",
                      "hover:bg-brand-500/15 hover:text-white",
                      today && "ring-1 ring-brand-400/35",
                      selected && "bg-brand-600 text-white shadow-[0_0_24px_rgba(234,89,220,.24)]"
                    )}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-line pt-2">
              <button type="button" onClick={() => commit(toIsoDate(new Date()))} className="rounded-crm px-2.5 py-1.5 text-center text-xs font-bold text-zinc-300 transition duration-premium ease-premium hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus">Hoje</button>
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

function calendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, currentMonth: date.getMonth() === month.getMonth() };
  });
}

function parseDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
