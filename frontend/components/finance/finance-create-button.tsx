"use client";

import { useState } from "react";
import { FinanceDialog } from "@/components/finance/finance-dialog";
import { FinanceFormFields } from "@/components/finance/finance-form-fields";
import { FinanceSubmitButton } from "@/components/finance/finance-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { createFinanceEntryAction } from "@/lib/finance/actions";
import type { FinanceSelectOption } from "@/lib/types/finance";

type FinanceCreateButtonProps = {
  clientOptions: FinanceSelectOption[];
  contractOptions: FinanceSelectOption[];
  projectOptions: FinanceSelectOption[];
  serviceOptions: FinanceSelectOption[];
};

export function FinanceCreateButton({
  clientOptions,
  contractOptions,
  projectOptions,
  serviceOptions
}: FinanceCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Novo lancamento
      </button>
      {isOpen ? (
        <FinanceDialog title="Cadastrar lancamento" eyebrow="Controle financeiro" onClose={() => setIsOpen(false)}>
          <SafeActionForm action={createFinanceEntryAction} onSuccess={() => setIsOpen(false)} className="mt-5 space-y-5">
            <FinanceFormFields
              clientOptions={clientOptions}
              contractOptions={contractOptions}
              projectOptions={projectOptions}
              serviceOptions={serviceOptions}
            />
            <FinanceDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar lancamento" />
          </SafeActionForm>
        </FinanceDialog>
      ) : null}
    </>
  );
}

export function FinanceDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <FinanceSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
