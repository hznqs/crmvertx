"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deletePerformanceAction, updatePerformanceAction } from "@/lib/performance/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { ClientPerformanceRecord, PerformanceClientOption } from "@/lib/types/performance";
import { PerformanceDialogFooter } from "@/components/performance/performance-create-button";
import { PerformanceDialog } from "@/components/performance/performance-dialog";
import { PerformanceFormFields } from "@/components/performance/performance-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";

type PerformanceRowActionsProps = {
  record: ClientPerformanceRecord;
  clientOptions: PerformanceClientOption[];
  actionPermissions: ModuleActionPermissions;
};

export function PerformanceRowActions({ record, clientOptions, actionPermissions }: PerformanceRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionMenu actions={performanceActions()} />

      {isEditing ? (
        <PerformanceDialog title="Editar performance" eyebrow={record.date} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updatePerformanceAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={record.id} />
            <PerformanceFormFields record={record} clientOptions={clientOptions} />
            <PerformanceDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </PerformanceDialog>
      ) : null}
    </div>
  );

  function performanceActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Arquivar performance",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deletePerformanceAction,
        fields: { id: record.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar performance",
        confirmationDescription: "Tem certeza que deseja arquivar este registro de performance?",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}
