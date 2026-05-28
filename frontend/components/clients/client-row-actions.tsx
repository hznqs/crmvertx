"use client";

import { useState } from "react";
import { ClientDialog, DialogFooter } from "@/components/clients/client-create-button";
import { ClientFormFields } from "@/components/clients/client-form-fields";
import { ClientSubmitButton } from "@/components/clients/client-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { PremiumSelect } from "@/components/ui/premium-select";
import { updateClientAction, updateClientPhaseAction, deleteClientAction } from "@/lib/clients/actions";
import { clientPhaseLabels } from "@/lib/clients/labels";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Client } from "@/lib/types/clients";

type ClientRowActionsProps = {
  client: Client;
  actionPermissions: ModuleActionPermissions;
};

export function ClientRowActions({ client, actionPermissions }: ClientRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPhase, setIsChangingPhase] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actionPermissions.canWrite ? (
        <>
          <RowActionButton onClick={() => setIsEditing(true)}>
            Editar
          </RowActionButton>
          <RowActionButton tone="brand" onClick={() => setIsChangingPhase(true)}>
            Fase
          </RowActionButton>
        </>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deleteClientAction}>
          <input type="hidden" name="id" value={client.id} />
          <ClientSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <ClientDialog title="Editar cliente" eyebrow={client.name} onClose={() => setIsEditing(false)}>
          <form action={updateClientAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={client.id} />
            <ClientFormFields client={client} />
            <DialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </ClientDialog>
      ) : null}

      {isChangingPhase ? (
        <ClientDialog title="Atualizar fase" eyebrow={client.name} onClose={() => setIsChangingPhase(false)}>
          <form action={updateClientPhaseAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={client.id} />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-300">Fase</span>
              <PremiumSelect name="phase" defaultValue={client.phase} options={Object.entries(clientPhaseLabels).map(([value, label]) => ({ value, label }))} />
            </label>
            <DialogFooter onClose={() => setIsChangingPhase(false)} submitLabel="Atualizar fase" />
          </form>
        </ClientDialog>
      ) : null}
    </div>
  );
}
