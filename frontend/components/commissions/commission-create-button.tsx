"use client";

import { useState } from "react";
import { createCommissionAction } from "@/lib/commissions/actions";
import type { CommissionSelectOption } from "@/lib/types/commissions";
import { CommissionDialog } from "@/components/commissions/commission-dialog";
import { CommissionFormFields } from "@/components/commissions/commission-form-fields";
import { CommissionSubmitButton } from "@/components/commissions/commission-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";

type CommissionCreateButtonProps = {
  memberOptions: CommissionSelectOption[];
  contractOptions: CommissionSelectOption[];
};

export function CommissionCreateButton({ memberOptions, contractOptions }: CommissionCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Nova comissao
      </button>
      {isOpen ? (
        <CommissionDialog title="Cadastrar comissao" eyebrow="Vendas e incentivo" onClose={() => setIsOpen(false)}>
          <form action={createCommissionAction} className="mt-5 space-y-5">
            <CommissionFormFields memberOptions={memberOptions} contractOptions={contractOptions} />
            <CommissionDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar comissao" />
          </form>
        </CommissionDialog>
      ) : null}
    </>
  );
}

export function CommissionDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <CommissionSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
