"use client";

import { useState } from "react";
import { FinanceDialogFooter } from "@/components/finance/finance-create-button";
import { FinanceDialog } from "@/components/finance/finance-dialog";
import { FinanceFormFields } from "@/components/finance/finance-form-fields";
import { FinanceSubmitButton } from "@/components/finance/finance-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { deleteFinanceEntryAction, updateFinanceEntryAction } from "@/lib/finance/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { FinanceEntry, FinanceSelectOption } from "@/lib/types/finance";

type FinanceRowActionsProps = {
  entry: FinanceEntry;
  clientOptions: FinanceSelectOption[];
  contractOptions: FinanceSelectOption[];
  projectOptions: FinanceSelectOption[];
  serviceOptions: FinanceSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function FinanceRowActions({
  entry,
  clientOptions,
  contractOptions,
  projectOptions,
  serviceOptions,
  actionPermissions
}: FinanceRowActionsProps) {
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
        <form action={deleteFinanceEntryAction}>
          <input type="hidden" name="id" value={entry.id} />
          <FinanceSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <FinanceDialog title="Editar lancamento" eyebrow={entry.description} onClose={() => setIsEditing(false)}>
          <form action={updateFinanceEntryAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={entry.id} />
            <FinanceFormFields
              entry={entry}
              clientOptions={clientOptions}
              contractOptions={contractOptions}
              projectOptions={projectOptions}
              serviceOptions={serviceOptions}
            />
            <FinanceDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </FinanceDialog>
      ) : null}
    </div>
  );
}
