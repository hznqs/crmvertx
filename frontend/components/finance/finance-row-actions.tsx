"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { FinanceDialogFooter } from "@/components/finance/finance-create-button";
import { FinanceDialog } from "@/components/finance/finance-dialog";
import { FinanceFormFields } from "@/components/finance/finance-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";
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
      <ActionMenu actions={financeActions()} />

      {isEditing ? (
        <FinanceDialog title="Editar lancamento" eyebrow={entry.description} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateFinanceEntryAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={entry.id} />
            <FinanceFormFields
              entry={entry}
              clientOptions={clientOptions}
              contractOptions={contractOptions}
              projectOptions={projectOptions}
              serviceOptions={serviceOptions}
            />
            <FinanceDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </FinanceDialog>
      ) : null}
    </div>
  );

  function financeActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Cancelar lancamento",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteFinanceEntryAction,
        fields: { id: entry.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Cancelar lancamento",
        confirmationDescription: "Tem certeza que deseja cancelar este lancamento financeiro? Isso pode afetar saldo, faturamento e relatorios.",
        confirmationActionLabel: "Cancelar lancamento"
      }
    ];
  }
}
