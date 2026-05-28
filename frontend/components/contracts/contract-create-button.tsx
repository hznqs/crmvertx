"use client";

import { useState } from "react";
import { ContractDialog } from "@/components/contracts/contract-dialog";
import { ContractFormFields } from "@/components/contracts/contract-form-fields";
import { ContractSubmitButton } from "@/components/contracts/contract-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { createContractAction } from "@/lib/contracts/actions";
import type { ContractSelectOption } from "@/lib/types/contracts";

type ContractCreateButtonProps = {
  clientOptions: ContractSelectOption[];
  serviceOptions: ContractSelectOption[];
  projectOptions: ContractSelectOption[];
};

export function ContractCreateButton({
  clientOptions,
  serviceOptions,
  projectOptions
}: ContractCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Novo contrato
      </button>
      {isOpen ? (
        <ContractDialog title="Cadastrar contrato" eyebrow="Receita recorrente" onClose={() => setIsOpen(false)}>
          <form action={createContractAction} className="mt-5 space-y-5">
            <ContractFormFields clientOptions={clientOptions} serviceOptions={serviceOptions} projectOptions={projectOptions} />
            <ContractDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar contrato" />
          </form>
        </ContractDialog>
      ) : null}
    </>
  );
}

export function ContractDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <ContractSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
