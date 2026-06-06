"use client";

import { useState } from "react";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { ProjectFormFields } from "@/components/projects/project-form-fields";
import { ProjectSubmitButton } from "@/components/projects/project-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { createProjectAction } from "@/lib/projects/actions";
import type { ProjectSelectOption } from "@/lib/types/projects";

type ProjectCreateButtonProps = {
  clientOptions: ProjectSelectOption[];
  serviceOptions: ProjectSelectOption[];
};

export function ProjectCreateButton({ clientOptions, serviceOptions }: ProjectCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Novo projeto
      </button>
      {isOpen ? (
        <ProjectDialog title="Cadastrar projeto" eyebrow="Operacao" onClose={() => setIsOpen(false)}>
          <SafeActionForm action={createProjectAction} onSuccess={() => setIsOpen(false)} className="mt-5 space-y-5">
            <ProjectFormFields clientOptions={clientOptions} serviceOptions={serviceOptions} />
            <ProjectDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar projeto" />
          </SafeActionForm>
        </ProjectDialog>
      ) : null}
    </>
  );
}

export function ProjectDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <ProjectSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
