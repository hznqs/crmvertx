"use client";

import { useState } from "react";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskFormFields } from "@/components/tasks/task-form-fields";
import { TaskSubmitButton } from "@/components/tasks/task-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { createTaskAction } from "@/lib/tasks/actions";
import type { TaskProjectOption } from "@/lib/types/tasks";

type TaskCreateButtonProps = {
  projectOptions: TaskProjectOption[];
};

export function TaskCreateButton({ projectOptions }: TaskCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Nova tarefa
      </button>
      {isOpen ? (
        <TaskDialog title="Cadastrar tarefa" eyebrow="Execucao" onClose={() => setIsOpen(false)}>
          <SafeActionForm action={createTaskAction} onSuccess={() => setIsOpen(false)} className="mt-5 space-y-5">
            <TaskFormFields projectOptions={projectOptions} />
            <TaskDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar tarefa" />
          </SafeActionForm>
        </TaskDialog>
      ) : null}
    </>
  );
}

export function TaskDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <TaskSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
