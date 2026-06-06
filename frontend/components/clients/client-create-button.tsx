"use client";

import { useState } from "react";
import { createClientAction } from "@/lib/clients/actions";
import { ClientFormFields } from "@/components/clients/client-form-fields";
import { ClientSubmitButton } from "@/components/clients/client-submit-button";
import { ModalDialog, ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";

export function ClientCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110"
      >
        Novo cliente
      </button>

      {isOpen ? (
        <ClientDialog title="Cadastrar cliente" eyebrow="Novo relacionamento" onClose={() => setIsOpen(false)}>
          <SafeActionForm action={createClientAction} onSuccess={() => setIsOpen(false)} className="mt-5 space-y-5">
            <ClientFormFields />
            <DialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar cliente" />
          </SafeActionForm>
        </ClientDialog>
      ) : null}
    </>
  );
}

export function ClientDialog({
  title,
  eyebrow,
  onClose,
  children
}: Readonly<{
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}>) {
  return (
    <ModalDialog title={title} eyebrow={eyebrow} onClose={onClose}>
      {children}
    </ModalDialog>
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
      <ClientSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
