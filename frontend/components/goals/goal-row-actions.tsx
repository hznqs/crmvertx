"use client";

import { useState } from "react";
import { deleteGoalAction, updateGoalAction } from "@/lib/goals/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Goal } from "@/lib/types/goals";
import { GoalDialogFooter } from "@/components/goals/goal-create-button";
import { GoalDialog } from "@/components/goals/goal-dialog";
import { GoalFormFields } from "@/components/goals/goal-form-fields";
import { GoalSubmitButton } from "@/components/goals/goal-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";

type GoalRowActionsProps = {
  goal: Goal;
  actionPermissions: ModuleActionPermissions;
};

export function GoalRowActions({ goal, actionPermissions }: GoalRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actionPermissions.canWrite ? (
        <RowActionButton onClick={() => setIsEditing(true)}>
          Editar
        </RowActionButton>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deleteGoalAction}>
          <input type="hidden" name="id" value={goal.id} />
          <GoalSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <GoalDialog title="Editar meta" eyebrow={goal.type} onClose={() => setIsEditing(false)}>
          <form action={updateGoalAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={goal.id} />
            <GoalFormFields goal={goal} />
            <GoalDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </GoalDialog>
      ) : null}
    </div>
  );
}
