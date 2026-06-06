"use client";

import { Layers3, Pencil, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";
import {
  convertLeadAction,
  deleteLeadAction,
  updateLeadAction,
  updateLeadStageAction
} from "@/lib/leads/actions";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { LeadSubmitButton } from "@/components/leads/lead-submit-button";
import { ModalDialog, ModalFooter } from "@/components/ui/modal-dialog";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { PremiumSelect } from "@/components/ui/premium-select";
import { commercialStageLabels } from "@/lib/leads/labels";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Lead } from "@/lib/types/leads";

type LeadRowActionsProps = {
  lead: Lead;
  actionPermissions: ModuleActionPermissions;
};

export function LeadRowActions({ lead, actionPermissions }: LeadRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionMenu actions={leadActions()} />

      {isEditing ? (
        <LeadEditDialog lead={lead} onClose={() => setIsEditing(false)} />
      ) : null}

      {isMoving ? (
        <LeadStageDialog lead={lead} onClose={() => setIsMoving(false)} />
      ) : null}
    </div>
  );

  function leadActions(): ActionMenuAction[] {
    const converted = lead.status === "CONVERTED" || Boolean(lead.convertedClientId);

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
        onSelect: () => setIsMoving(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Converter em cliente",
        icon: UserCheck,
        variant: "secondary",
        formAction: convertLeadAction,
        fields: { id: lead.id },
        hidden: !actionPermissions.canWrite || converted,
        tooltip: "Cria o cliente e remove o lead do pipeline ativo."
      },
      {
        label: "Arquivar lead",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteLeadAction,
        fields: { id: lead.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar lead",
        confirmationDescription: "Tem certeza que deseja arquivar este lead? Ele deixara de aparecer no pipeline ativo.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}

function LeadEditDialog({
  lead,
  onClose
}: Readonly<{
  lead: Lead;
  onClose: () => void;
}>) {
  return (
    <ModalDialog title="Editar lead" eyebrow={lead.name} onClose={onClose} maxWidthClassName="max-w-3xl">
        <SafeActionForm action={updateLeadAction} onSuccess={onClose} className="mt-5 space-y-5">
          <input type="hidden" name="id" value={lead.id} />
          <LeadFormFields lead={lead} mode="edit" />
          <DialogFooter onClose={onClose} submitLabel="Salvar alteracoes" />
        </SafeActionForm>
    </ModalDialog>
  );
}

function LeadStageDialog({
  lead,
  onClose
}: Readonly<{
  lead: Lead;
  onClose: () => void;
}>) {
  return (
    <ModalDialog title="Atualizar fase" eyebrow={lead.name} onClose={onClose} maxWidthClassName="max-w-lg">
        <SafeActionForm action={updateLeadStageAction} onSuccess={onClose} className="mt-5 space-y-5">
          <input type="hidden" name="id" value={lead.id} />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-300">Fase comercial</span>
            <PremiumSelect name="commercialStage" defaultValue={lead.commercialStage} options={Object.entries(commercialStageLabels).map(([value, label]) => ({ value, label }))} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-300">Motivo de perda</span>
            <input
              name="lostReason"
              defaultValue={lead.lostReason ?? ""}
              className="min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
              placeholder="Obrigatorio se a fase for perdido"
            />
          </label>
          <DialogFooter onClose={onClose} submitLabel="Atualizar fase" />
        </SafeActionForm>
    </ModalDialog>
  );
}

function DialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <LeadSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
