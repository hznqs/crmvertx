"use client";

import { useState } from "react";
import { DeliveryDialog } from "@/components/deliveries/delivery-dialog";
import { DeliveryFormFields } from "@/components/deliveries/delivery-form-fields";
import { DeliverySubmitButton } from "@/components/deliveries/delivery-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { createDeliveryAction } from "@/lib/deliveries/actions";
import type { DeliverySelectOption } from "@/lib/types/deliveries";

type DeliveryCreateButtonProps = {
  clientOptions: DeliverySelectOption[];
  projectOptions: DeliverySelectOption[];
  contractOptions: DeliverySelectOption[];
  serviceOptions: DeliverySelectOption[];
};

export function DeliveryCreateButton({
  clientOptions,
  projectOptions,
  contractOptions,
  serviceOptions
}: DeliveryCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Nova entrega
      </button>
      {isOpen ? (
        <DeliveryDialog title="Cadastrar entrega" eyebrow="Pipeline operacional" onClose={() => setIsOpen(false)}>
          <form action={createDeliveryAction} className="mt-5 space-y-5">
            <DeliveryFormFields
              clientOptions={clientOptions}
              projectOptions={projectOptions}
              contractOptions={contractOptions}
              serviceOptions={serviceOptions}
            />
            <DeliveryDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar entrega" />
          </form>
        </DeliveryDialog>
      ) : null}
    </>
  );
}

export function DeliveryDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <DeliverySubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
