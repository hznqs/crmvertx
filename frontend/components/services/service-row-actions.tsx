"use client";

import { useState } from "react";
import { DialogFooter } from "@/components/services/service-create-button";
import { ServiceDialog } from "@/components/services/service-dialog";
import { ServiceFormFields } from "@/components/services/service-form-fields";
import { ServiceSubmitButton } from "@/components/services/service-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { deleteServiceAction, updateServiceAction } from "@/lib/services/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { ServiceOffering } from "@/lib/types/services";

type ServiceRowActionsProps = {
  service: ServiceOffering;
  actionPermissions: ModuleActionPermissions;
};

export function ServiceRowActions({ service, actionPermissions }: ServiceRowActionsProps) {
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
        <form action={deleteServiceAction}>
          <input type="hidden" name="id" value={service.id} />
          <ServiceSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <ServiceDialog title="Editar servico" eyebrow={service.name} onClose={() => setIsEditing(false)}>
          <form action={updateServiceAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={service.id} />
            <ServiceFormFields service={service} />
            <DialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </ServiceDialog>
      ) : null}
    </div>
  );
}
