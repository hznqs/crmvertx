"use client";

import { Archive, FileText, Layers3, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ClientDialog, DialogFooter } from "@/components/clients/client-create-button";
import { ClientFormFields } from "@/components/clients/client-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { PremiumSelect } from "@/components/ui/premium-select";
import { SafeActionForm } from "@/components/ui/safe-action-form";
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
      <ActionMenu actions={clientActions()} />

      {isEditing ? (
        <ClientDialog title="Editar cliente" eyebrow={client.name} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateClientAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={client.id} />
            <ClientFormFields client={client} />
            <DialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </ClientDialog>
      ) : null}

      {isChangingPhase ? (
        <ClientDialog title="Atualizar fase" eyebrow={client.name} onClose={() => setIsChangingPhase(false)}>
          <SafeActionForm action={updateClientPhaseAction} onSuccess={() => setIsChangingPhase(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={client.id} />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-300">Fase</span>
              <PremiumSelect name="phase" defaultValue={client.phase} options={Object.entries(clientPhaseLabels).map(([value, label]) => ({ value, label }))} />
            </label>
            <DialogFooter onClose={() => setIsChangingPhase(false)} submitLabel="Atualizar fase" />
          </SafeActionForm>
        </ClientDialog>
      ) : null}
    </div>
  );

  function clientActions(): ActionMenuAction[] {
    const destructiveLabel = client.hasContractHistory ? "Inativar cliente" : "Excluir cliente";

    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Alterar fase",
        icon: Layers3,
        variant: "secondary",
        onSelect: () => setIsChangingPhase(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Ver contratos",
        icon: FileText,
        href: `/contracts?clientId=${encodeURIComponent(client.id)}`
      },
      {
        label: destructiveLabel,
        icon: client.hasContractHistory ? Archive : Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteClientAction,
        fields: { id: client.id },
        hidden: !actionPermissions.canManage,
        disabled: client.hasActiveContracts,
        tooltip: client.hasActiveContracts ? "Cliente possui contrato ativo e nao pode ser excluido." : undefined,
        requiresConfirmation: true,
        confirmationTitle: destructiveLabel,
        confirmationDescription: client.hasContractHistory
          ? "Este cliente possui historico de contrato. Ele sera inativado para preservar dados financeiros e operacionais."
          : "Tem certeza que deseja excluir este cliente? Esta acao nao deve ser usada se houver historico operacional.",
        confirmationActionLabel: client.hasContractHistory ? "Inativar" : "Excluir"
      }
    ];
  }
}
