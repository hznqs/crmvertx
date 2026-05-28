"use client";

import { useState } from "react";
import { ContractDialogFooter } from "@/components/contracts/contract-create-button";
import { ContractDialog } from "@/components/contracts/contract-dialog";
import { ContractFormFields } from "@/components/contracts/contract-form-fields";
import { ContractSubmitButton } from "@/components/contracts/contract-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { deleteContractAction, updateContractAction } from "@/lib/contracts/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Contract, ContractSelectOption } from "@/lib/types/contracts";

type ContractRowActionsProps = {
  contract: Contract;
  clientOptions: ContractSelectOption[];
  serviceOptions: ContractSelectOption[];
  projectOptions: ContractSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function ContractRowActions({
  contract,
  clientOptions,
  serviceOptions,
  projectOptions,
  actionPermissions
}: ContractRowActionsProps) {
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
        <form action={deleteContractAction}>
          <input type="hidden" name="id" value={contract.id} />
          <ContractSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <ContractDialog title="Editar contrato" eyebrow={contract.plan} onClose={() => setIsEditing(false)}>
          <form action={updateContractAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={contract.id} />
            <ContractFormFields
              contract={contract}
              clientOptions={clientOptions}
              serviceOptions={serviceOptions}
              projectOptions={projectOptions}
            />
            <ContractDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </ContractDialog>
      ) : null}
    </div>
  );
}
