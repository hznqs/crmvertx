"use client";

import { useState } from "react";
import { createPerformanceAction } from "@/lib/performance/actions";
import type { PerformanceClientOption } from "@/lib/types/performance";
import { PerformanceDialog } from "@/components/performance/performance-dialog";
import { PerformanceFormFields } from "@/components/performance/performance-form-fields";
import { PerformanceSubmitButton } from "@/components/performance/performance-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";

type PerformanceCreateButtonProps = {
  clientOptions: PerformanceClientOption[];
};

export function PerformanceCreateButton({ clientOptions }: PerformanceCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Novo registro
      </button>
      {isOpen ? (
        <PerformanceDialog title="Cadastrar performance" eyebrow="Marketing" onClose={() => setIsOpen(false)}>
          <SafeActionForm action={createPerformanceAction} onSuccess={() => setIsOpen(false)} className="mt-5 space-y-5">
            <PerformanceFormFields clientOptions={clientOptions} />
            <PerformanceDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar performance" />
          </SafeActionForm>
        </PerformanceDialog>
      ) : null}
    </>
  );
}

export function PerformanceDialogFooter({ onClose, submitLabel }: Readonly<{ onClose: () => void; submitLabel: string }>) {
  return (
    <ModalFooter onClose={onClose}>
      <PerformanceSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
