"use client";

import { useState } from "react";
import { createGoalAction } from "@/lib/goals/actions";
import { GoalDialog } from "@/components/goals/goal-dialog";
import { GoalFormFields } from "@/components/goals/goal-form-fields";
import { GoalSubmitButton } from "@/components/goals/goal-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";

export function GoalCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Nova meta
      </button>
      {isOpen ? (
        <GoalDialog title="Cadastrar meta" eyebrow="Performance" onClose={() => setIsOpen(false)}>
          <form action={createGoalAction} className="mt-5 space-y-5">
            <GoalFormFields />
            <GoalDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar meta" />
          </form>
        </GoalDialog>
      ) : null}
    </>
  );
}

export function GoalDialogFooter({ onClose, submitLabel }: Readonly<{ onClose: () => void; submitLabel: string }>) {
  return (
    <ModalFooter onClose={onClose}>
      <GoalSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
