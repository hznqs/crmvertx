"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FloatingLayer } from "@/components/ui/floating-layer";
import { cn } from "@/lib/utils";

type TimePickerProps = Readonly<{
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

const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));

export function TimePicker({
  name,
  value,
  defaultValue = "",
  onChange,
  required,
  disabled,
  placeholder = "Selecionar horario",
  className,
  ariaLabel = "Selecionar horario"
}: TimePickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = normalizeTime(value ?? internalValue);
  const [draftHour, setDraftHour] = useState(() => selectedValue.slice(0, 2) || "09");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ left: 16, top: 16, width: 288, maxHeight: 360 });
  const currentTime = useMemo(() => toTimeValue(new Date()), []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const margin = 12;
      const gap = 8;
      const width = Math.min(288, window.innerWidth - margin * 2);
      const estimatedHeight = 330;
      const rect = trigger.getBoundingClientRect();
      const left = clamp(rect.left, margin, window.innerWidth - width - margin);
      const availableBelow = Math.max(0, window.innerHeight - rect.bottom - gap - margin);
      const availableAbove = Math.max(0, rect.top - gap - margin);
      const openBelow = availableBelow >= Math.min(estimatedHeight, 220) || availableBelow >= availableAbove;
      const maxHeight = Math.max(220, Math.min(estimatedHeight, openBelow ? availableBelow : availableAbove));
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
  }, [open, selectedValue]);

  function commit(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
    setOpen(false);
  }

  function togglePicker() {
    if (open) {
      setOpen(false);
      return;
    }
    const selectedHour = selectedValue.slice(0, 2);
    if (selectedHour) setDraftHour(selectedHour);
    setOpen(true);
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
        onClick={togglePicker}
        className={cn("crm-control group flex w-full items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-55", open && "border-brand-400 shadow-focus")}
      >
        <span className={cn("min-w-0 truncate", selectedValue ? "font-semibold text-white" : "text-zinc-500")}>
          {selectedValue || placeholder}
        </span>
        <Clock className="h-4 w-4 text-brand-400 transition group-hover:scale-110" aria-hidden />
      </button>

      <FloatingLayer>
        <AnimatePresence>
          {open ? (
            <>
              <button
                type="button"
                aria-label="Fechar seletor de horario"
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
              className="crm-popover-surface calendar-scrollbar fixed z-50 overflow-y-auto p-3"
              style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
            >
              <div className="grid grid-cols-[1fr_0.8fr] gap-3">
                <PickerColumn title="Hora">
                  {hourOptions.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setDraftHour(hour)}
                      className={cn("crm-menu-item flex items-center justify-between text-left", draftHour === hour && "crm-menu-item-active")}
                    >
                      {hour}
                      {draftHour === hour ? <Check className="h-3.5 w-3.5 text-brand-400" aria-hidden /> : null}
                    </button>
                  ))}
                </PickerColumn>
                <PickerColumn title="Min">
                  {minuteOptions.map((minute) => {
                    const nextValue = `${draftHour}:${minute}`;
                    const selected = nextValue === selectedValue;
                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => commit(nextValue)}
                        className={cn("crm-menu-item flex items-center justify-between text-left", selected && "crm-menu-item-active")}
                      >
                        {minute}
                        {selected ? <Check className="h-3.5 w-3.5 text-brand-400" aria-hidden /> : null}
                      </button>
                    );
                  })}
                </PickerColumn>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
                <button type="button" onClick={() => commit(currentTime)} className="crm-menu-item text-center">Agora</button>
                <button type="button" onClick={() => commit("")} className="crm-menu-item text-center">Limpar</button>
              </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </FloatingLayer>
    </div>
  );
}

function PickerColumn({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <div className="min-w-0">
      <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">{title}</p>
      <div className="calendar-scrollbar max-h-56 space-y-1 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}

function normalizeTime(value: string) {
  if (!value) return "";
  const [hour, minute] = value.split(":");
  if (!hour || !minute) return "";
  return `${hour.padStart(2, "0").slice(0, 2)}:${minute.padStart(2, "0").slice(0, 2)}`;
}

function toTimeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(Math.floor(date.getMinutes() / 5) * 5).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
