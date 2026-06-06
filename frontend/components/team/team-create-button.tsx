"use client";

import { useState } from "react";
import { createTeamMemberAction } from "@/lib/team/actions";
import { TeamDialog } from "@/components/team/team-dialog";
import { TeamFormFields } from "@/components/team/team-form-fields";
import { TeamSubmitButton } from "@/components/team/team-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";

export function TeamCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Novo membro
      </button>
      {isOpen ? (
        <TeamDialog title="Cadastrar membro" eyebrow="Capacidade operacional" onClose={() => setIsOpen(false)}>
          <SafeActionForm action={createTeamMemberAction} onSuccess={() => setIsOpen(false)} className="mt-5 space-y-5">
            <TeamFormFields />
            <TeamDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar membro" />
          </SafeActionForm>
        </TeamDialog>
      ) : null}
    </>
  );
}

export function TeamDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <TeamSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
