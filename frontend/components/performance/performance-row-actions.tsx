"use client";

import { useState } from "react";
import { deletePerformanceAction, updatePerformanceAction } from "@/lib/performance/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { ClientPerformanceRecord, PerformanceClientOption } from "@/lib/types/performance";
import { PerformanceDialogFooter } from "@/components/performance/performance-create-button";
import { PerformanceDialog } from "@/components/performance/performance-dialog";
import { PerformanceFormFields } from "@/components/performance/performance-form-fields";
import { PerformanceSubmitButton } from "@/components/performance/performance-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";

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
      {actionPermissions.canWrite ? (
        <RowActionButton onClick={() => setIsEditing(true)}>
          Editar
        </RowActionButton>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deletePerformanceAction}>
          <input type="hidden" name="id" value={record.id} />
          <PerformanceSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <PerformanceDialog title="Editar performance" eyebrow={record.date} onClose={() => setIsEditing(false)}>
          <form action={updatePerformanceAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={record.id} />
            <PerformanceFormFields record={record} clientOptions={clientOptions} />
            <PerformanceDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </PerformanceDialog>
      ) : null}
    </div>
  );
}
