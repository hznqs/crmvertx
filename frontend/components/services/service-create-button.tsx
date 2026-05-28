"use client";

import { useState } from "react";
import { createServiceAction } from "@/lib/services/actions";
import { ServiceDialog } from "@/components/services/service-dialog";
import { ServiceFormFields } from "@/components/services/service-form-fields";
import { ServiceSubmitButton } from "@/components/services/service-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";

export function ServiceCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Novo servico
      </button>
      {isOpen ? (
        <ServiceDialog title="Cadastrar servico" eyebrow="Catalogo operacional" onClose={() => setIsOpen(false)}>
          <form action={createServiceAction} className="mt-5 space-y-5">
            <ServiceFormFields />
            <DialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar servico" />
          </form>
        </ServiceDialog>
      ) : null}
    </>
  );
}

export function DialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <ServiceSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
