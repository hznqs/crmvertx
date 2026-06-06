"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FloatingLayer } from "@/components/ui/floating-layer";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type PremiumSelectProps = Readonly<{
  name?: string;
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}>;

export function PremiumSelect({
  name,
  value,
  defaultValue = "",
  options,
  placeholder = "Selecionar",
  required,
  disabled,
  searchable = options.length > 8,
  className,
  onChange
}: PremiumSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ left: 16, top: 16, width: 280, maxHeight: 340 });
  const selectedValue = value ?? internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(normalized));
  }, [options, query]);
  const visibleActiveIndex = Math.min(activeIndex, Math.max(filteredOptions.length - 1, 0));

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const margin = 12;
      const gap = 8;
      const width = Math.min(Math.max(rect.width, 260), window.innerWidth - margin * 2);
      const left = clamp(rect.left, margin, window.innerWidth - width - margin);
      const estimatedListHeight = filteredOptions.length ? Math.min(filteredOptions.length * 48, 340) : 96;
      const estimatedPanelHeight = Math.min(estimatedListHeight + (searchable ? 72 : 20), 420);
      const availableBelow = Math.max(0, window.innerHeight - rect.bottom - gap - margin);
      const availableAbove = Math.max(0, rect.top - gap - margin);
      const openBelow = availableBelow >= Math.min(estimatedPanelHeight, 220) || availableBelow >= availableAbove;
      const availableHeight = openBelow ? availableBelow : availableAbove;
      const panelHeight = Math.max(120, Math.min(estimatedPanelHeight, availableHeight));
      const top = openBelow
        ? rect.bottom + gap
        : clamp(rect.top - panelHeight - gap, margin, window.innerHeight - panelHeight - margin);

      setPosition({ left, top, width, maxHeight: Math.max(96, panelHeight - (searchable ? 72 : 20)) });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [filteredOptions.length, open, searchable]);

  function commit(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
    setOpen(false);
    setQuery("");
  }

  function openMenu() {
    const currentIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
    setActiveIndex(currentIndex);
    setOpen(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[visibleActiveIndex];
      if (option && !option.disabled) commit(option.value);
    }
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      {name ? <input type="hidden" name={name} value={selectedValue} required={required} /> : null}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "crm-select-trigger disabled:cursor-not-allowed disabled:opacity-55",
          open && "border-brand-400 shadow-focus"
        )}
      >
        <span className={cn("min-w-0 truncate", selectedOption ? "text-white" : "text-zinc-500")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-brand-400 transition duration-premium ease-premium", open && "rotate-180")} aria-hidden />
      </button>

      <FloatingLayer>
        <AnimatePresence>
          {open ? (
            <>
              <button
                type="button"
                aria-label="Fechar menu"
                className="fixed inset-0 z-40 cursor-default bg-transparent"
                onClick={() => setOpen(false)}
              />
              <motion.div
                id={listboxId}
                role="listbox"
                tabIndex={-1}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                onKeyDown={handleListKeyDown}
                className="crm-floating-panel fixed z-50 p-2"
                style={{ left: position.left, top: position.top, width: position.width }}
              >
                {searchable ? (
                  <label className="mb-2 flex min-h-10 items-center gap-2 rounded-crm border border-line bg-white/[0.045] px-3">
                    <Search className="h-4 w-4 text-brand-400" aria-hidden />
                    <input
                      autoFocus
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setActiveIndex(0);
                      }}
                      placeholder="Buscar opcao..."
                      className="min-h-0 flex-1 border-0 bg-transparent px-0 text-sm text-white shadow-none outline-none placeholder:text-zinc-500 focus:shadow-none"
                    />
                  </label>
                ) : null}

                <div className="calendar-scrollbar overflow-y-auto pr-1" style={{ maxHeight: position.maxHeight }}>
                  {filteredOptions.length ? (
                    filteredOptions.map((option, index) => {
                      const selected = option.value === selectedValue;
                      const active = index === visibleActiveIndex;
                      return (
                        <button
                          key={`${option.value}-${option.label}`}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          disabled={option.disabled}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => commit(option.value)}
                          className={cn(
                            "crm-menu-item flex min-h-11 w-full items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-45",
                            (selected || active) && "crm-menu-item-active"
                          )}
                        >
                          <span className={cn("grid h-5 w-5 place-items-center rounded-md border border-line bg-white/[0.035]", selected && "border-brand-400/30 bg-brand-500/20")}>
                            {selected ? <Check className="h-3.5 w-3.5 text-brand-400" aria-hidden /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{option.label}</span>
                            {option.description ? <span className="mt-0.5 block truncate text-xs text-zinc-500">{option.description}</span> : null}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-crm border border-line bg-white/[0.035] px-3 py-6 text-center text-sm text-muted">
                      Nenhuma opcao encontrada.
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </FloatingLayer>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
