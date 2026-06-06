"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalDialogProps = Readonly<{
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
}>;

export function ModalDialog({
  title,
  eyebrow,
  onClose,
  children,
  maxWidthClassName = "max-w-4xl"
}: ModalDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#090909]/78 p-2 backdrop-blur-xl sm:p-4">
      <motion.section
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={`crm-popover-surface calendar-scrollbar max-h-[92vh] w-full max-w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:p-5 ${maxWidthClassName}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">
              {eyebrow}
            </p>
            <h2 className="mt-1 break-words text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-crm border border-line bg-white/[0.045] text-zinc-300 transition duration-premium ease-premium hover:border-brand-400/40 hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        {children}
      </motion.section>
    </div>
  );
}

export function ModalFooter({
  onClose,
  children
}: Readonly<{
  onClose: () => void;
  children: ReactNode;
}>) {
  return (
    <div className="flex justify-end gap-3 border-t border-line pt-4">
      <button
        type="button"
        onClick={onClose}
      className="crm-button-secondary"
      >
        Cancelar
      </button>
      {children}
    </div>
  );
}
