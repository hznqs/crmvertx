"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteGoalAction, updateGoalAction } from "@/lib/goals/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Goal } from "@/lib/types/goals";
import { GoalDialogFooter } from "@/components/goals/goal-create-button";
import { GoalDialog } from "@/components/goals/goal-dialog";
import { GoalFormFields } from "@/components/goals/goal-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";

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
      <ActionMenu actions={goalActions()} />

      {isEditing ? (
        <GoalDialog title="Editar meta" eyebrow={goal.type} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateGoalAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={goal.id} />
            <GoalFormFields goal={goal} />
            <GoalDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </GoalDialog>
      ) : null}
    </div>
  );

  function goalActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Arquivar meta",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteGoalAction,
        fields: { id: goal.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar meta",
        confirmationDescription: "Tem certeza que deseja arquivar esta meta? O progresso historico pode deixar de aparecer nas listagens.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}
