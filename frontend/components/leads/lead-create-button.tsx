"use client";

import { useState } from "react";
import { createLeadAction } from "@/lib/leads/actions";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { LeadSubmitButton } from "@/components/leads/lead-submit-button";
import { ModalDialog, ModalFooter } from "@/components/ui/modal-dialog";

export function LeadCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110"
      >
        Novo lead
      </button>

      {isOpen ? (
        <ModalDialog
          title="Cadastrar lead"
          eyebrow="Nova oportunidade"
          onClose={() => setIsOpen(false)}
          maxWidthClassName="max-w-3xl"
        >
          <form action={createLeadAction} className="mt-5 space-y-5">
            <LeadFormFields mode="create" />
            <ModalFooter onClose={() => setIsOpen(false)}>
                <LeadSubmitButton idleLabel="Salvar lead" pendingLabel="Salvando..." />
            </ModalFooter>
          </form>
        </ModalDialog>
      ) : null}
    </>
  );
}
