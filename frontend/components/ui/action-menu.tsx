"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FloatingLayer } from "@/components/ui/floating-layer";
import { ModalDialog, ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { cn } from "@/lib/utils";

type ActionVariant = "default" | "secondary" | "warning" | "danger";
type ActionFormAction = (formData: FormData) => Promise<unknown> | unknown;

type ActionMenuBaseAction = {
  label: string;
  icon?: LucideIcon;
  variant?: ActionVariant;
  hidden?: boolean;
  disabled?: boolean;
  tooltip?: string;
  separatorBefore?: boolean;
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  confirmationActionLabel?: string;
};

export type ActionMenuAction =
  | (ActionMenuBaseAction & { onSelect: () => void; href?: never; formAction?: never; fields?: never })
  | (ActionMenuBaseAction & { href: string; onSelect?: never; formAction?: never; fields?: never })
  | (ActionMenuBaseAction & { formAction: ActionFormAction; fields?: Record<string, string | number | boolean | null | undefined>; onSelect?: never; href?: never });

type ActionMenuProps = Readonly<{
  actions: ActionMenuAction[];
  label?: string;
  align?: "start" | "end";
  className?: string;
}>;

export function ActionMenu({ actions, label = "Acoes", align = "end", className }: ActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionMenuAction | null>(null);
  const [position, setPosition] = useState({ left: 16, top: 16, width: 320, maxHeight: 420 });
  const visibleActions = actions.filter((action) => !action.hidden);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const margin = 12;
      const gap = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(Math.max(320, rect.width), viewportWidth - margin * 2, 380);
      const preferredLeft = align === "end" ? rect.right - width : rect.left;
      const left = clamp(preferredLeft, margin, viewportWidth - width - margin);
      const estimatedHeight = Math.min(Math.max(visibleActions.length * 58 + 20, 104), 520);
      const maxHeight = Math.max(180, viewportHeight - margin * 2);
      const availableBelow = viewportHeight - rect.bottom - gap - margin;
      const openBelow = availableBelow >= Math.min(estimatedHeight, 220);
      const top = openBelow
        ? rect.bottom + gap
        : clamp(rect.top - Math.min(estimatedHeight, maxHeight) - gap, margin, viewportHeight - Math.min(estimatedHeight, maxHeight) - margin);
      const availablePanelHeight = Math.max(180, viewportHeight - top - margin);

      setPosition({ left, top, width, maxHeight: Math.min(maxHeight, availablePanelHeight, Math.max(180, estimatedHeight)) });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, open, visibleActions.length]);

  if (!visibleActions.length) {
    return null;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-crm border border-line bg-white/[0.045] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] transition duration-premium ease-premium hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus",
          open && "border-brand-400/35 bg-brand-500/15 text-white",
          className
        )}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>

      <FloatingLayer>
        <AnimatePresence>
          {open ? (
            <>
              <button
                type="button"
                aria-label="Fechar menu de acoes"
                className="fixed inset-0 z-40 cursor-default bg-transparent"
                onClick={() => setOpen(false)}
              />
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="crm-floating-panel calendar-scrollbar fixed z-50 max-w-[calc(100vw-1.5rem)] overflow-y-auto p-2"
                style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
              >
                <div className="grid gap-1">
                  {visibleActions.map((action, index) => (
                    <ActionMenuItem
                      key={`${action.label}-${index}`}
                      action={action}
                      onClose={() => setOpen(false)}
                      onConfirm={() => {
                        setOpen(false);
                        setPendingAction(action);
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </FloatingLayer>

      {pendingAction ? (
        <ActionConfirmationDialog
          action={pendingAction}
          onClose={() => setPendingAction(null)}
        />
      ) : null}
    </>
  );
}

function ActionMenuItem({
  action,
  onClose,
  onConfirm
}: Readonly<{
  action: ActionMenuAction;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  const Icon = action.icon;
  const disabled = Boolean(action.disabled);
  const className = cn(
    "crm-menu-item flex min-h-11 w-full items-start gap-3 text-left disabled:cursor-not-allowed disabled:opacity-55",
    action.separatorBefore && "mt-2 border-t border-line/80 pt-3",
    action.variant === "danger" && "text-rose-100 hover:border-rose-300/20 hover:bg-rose-500/12",
    action.variant === "warning" && "text-amber-100 hover:border-amber-300/20 hover:bg-amber-500/12",
    action.variant === "secondary" && "text-zinc-300"
  );

  const content = (
    <>
      <span className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.035]",
        action.variant === "danger" && "border-rose-300/20 bg-rose-500/10",
        action.variant === "warning" && "border-amber-300/20 bg-amber-500/10"
      )}>
        {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      </span>
      <span className="min-w-0 flex-1 py-0.5">
        <span className="block break-words text-sm font-bold leading-snug">{action.label}</span>
        {action.tooltip ? <span className="mt-1 block break-words text-xs leading-5 text-zinc-500">{action.tooltip}</span> : null}
      </span>
    </>
  );

  if (action.href) {
    return (
      <Link
        href={action.href}
        role="menuitem"
        aria-disabled={disabled}
        className={cn(className, disabled && "pointer-events-none opacity-45")}
        onClick={onClose}
      >
        {content}
      </Link>
    );
  }

  if (action.formAction) {
    if (action.requiresConfirmation) {
      return (
        <button
          type="button"
          role="menuitem"
          disabled={disabled}
          className={className}
          title={action.tooltip}
          onClick={onConfirm}
        >
          {content}
        </button>
      );
    }

    return (
      <SafeActionForm action={action.formAction} className="contents" onSuccess={onClose}>
        {Object.entries(action.fields ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={String(value ?? "")} />
        ))}
        <button type="submit" role="menuitem" disabled={disabled} className={className} title={action.tooltip}>
          {content}
        </button>
      </SafeActionForm>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={className}
      title={action.tooltip}
      onClick={() => {
        if (action.requiresConfirmation) {
          onConfirm();
          return;
        }

        if ("onSelect" in action && action.onSelect) {
          action.onSelect();
        }
        onClose();
      }}
    >
      {content}
    </button>
  );
}

function ActionConfirmationDialog({
  action,
  onClose
}: Readonly<{
  action: ActionMenuAction;
  onClose: () => void;
}>) {
  const Icon = action.icon;

  return (
    <ModalDialog
      title={action.confirmationTitle ?? action.label}
      eyebrow="Confirmar acao"
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <div className="mt-5 space-y-5">
        <div className="flex gap-3 rounded-xl border border-line bg-white/[0.035] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100">
            {Icon ? <Icon className="h-5 w-5" aria-hidden /> : <MoreHorizontal className="h-5 w-5" aria-hidden />}
          </span>
          <p className="text-sm leading-6 text-zinc-300">
            {action.confirmationDescription ?? "Confirme para executar esta acao. Ela pode afetar historico, metricas e dados relacionados."}
          </p>
        </div>

        {action.formAction ? (
          <SafeActionForm action={action.formAction} onSuccess={onClose} className="space-y-4">
            {Object.entries(action.fields ?? {}).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={String(value ?? "")} />
            ))}
            <ModalFooter onClose={onClose}>
              <button type="submit" className="crm-button-danger">
                {action.confirmationActionLabel ?? action.label}
              </button>
            </ModalFooter>
          </SafeActionForm>
        ) : (
          <ModalFooter onClose={onClose}>
            <button
              type="button"
              className={cn("crm-button-danger", action.variant !== "danger" && "crm-button-primary")}
              onClick={() => {
                if ("onSelect" in action && action.onSelect) {
                  action.onSelect();
                }
                onClose();
              }}
            >
              {action.confirmationActionLabel ?? action.label}
            </button>
          </ModalFooter>
        )}
      </div>
    </ModalDialog>
  );
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
