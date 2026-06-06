"use client";

import { Archive, Ban, Pencil, RefreshCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { ContractDialogFooter } from "@/components/contracts/contract-create-button";
import { ContractDialog } from "@/components/contracts/contract-dialog";
import { ContractFormFields } from "@/components/contracts/contract-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { cancelContractAction, deleteContractAction, nonRenewContractAction, renewContractAction, updateContractAction } from "@/lib/contracts/actions";
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [isNonRenewing, setIsNonRenewing] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const isLost = contract.status === "cancelado" || contract.status === "nao_renovado";

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionMenu actions={contractActions()} />

      {isEditing ? (
        <ContractDialog title="Editar contrato" eyebrow={contract.plan} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateContractAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={contract.id} />
            <ContractFormFields
              contract={contract}
              clientOptions={clientOptions}
              serviceOptions={serviceOptions}
              projectOptions={projectOptions}
            />
            <ContractDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </ContractDialog>
      ) : null}

      {isCancelling ? (
        <LifecycleDialog
          contract={contract}
          title="Cancelar contrato"
          eyebrow={contract.recurring ? "Churn recorrente" : "Cancelamento avulso"}
          action={cancelContractAction}
          submitLabel="Cancelar contrato"
          onClose={() => setIsCancelling(false)}
        />
      ) : null}

      {isNonRenewing ? (
        <LifecycleDialog
          contract={contract}
          title="Marcar como nao renovado"
          eyebrow="Retencao e churn"
          action={nonRenewContractAction}
          submitLabel="Marcar nao renovado"
          onClose={() => setIsNonRenewing(false)}
        />
      ) : null}

      {isRenewing ? (
        <ContractDialog title="Renovar contrato" eyebrow={contract.plan} onClose={() => setIsRenewing(false)}>
          <SafeActionForm action={renewContractAction} onSuccess={() => setIsRenewing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={contract.id} />
            <ContractFormFields
              contract={{
                ...contract,
                status: "ativo",
                renewedFromContractId: contract.id,
                renewedToContractId: null,
                cancelledAt: null,
                endedAt: null,
                cancellationReason: null,
                churnReason: null,
                nonRenewalReason: null,
                mrrLost: 0
              }}
              clientOptions={clientOptions}
              serviceOptions={serviceOptions}
              projectOptions={projectOptions}
            />
            <ContractDialogFooter onClose={() => setIsRenewing(false)} submitLabel="Salvar renovacao" />
          </SafeActionForm>
        </ContractDialog>
      ) : null}
    </div>
  );

  function contractActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Renovar",
        icon: RefreshCcw,
        variant: "secondary",
        onSelect: () => setIsRenewing(true),
        hidden: !actionPermissions.canManage || isLost || !contract.recurring
      },
      {
        label: "Marcar como nao renovado",
        icon: Ban,
        variant: "warning",
        onSelect: () => setIsNonRenewing(true),
        hidden: !actionPermissions.canManage || isLost || !contract.recurring
      },
      {
        label: "Cancelar contrato",
        icon: XCircle,
        variant: "danger",
        separatorBefore: true,
        onSelect: () => setIsCancelling(true),
        hidden: !actionPermissions.canManage || isLost
      },
      {
        label: "Arquivar contrato",
        icon: Archive,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteContractAction,
        fields: { id: contract.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar contrato",
        confirmationDescription: "Tem certeza que deseja arquivar este contrato? O historico continua preservado, mas ele deixara de aparecer nas listas ativas.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}

function LifecycleDialog({
  contract,
  title,
  eyebrow,
  action,
  submitLabel,
  onClose
}: Readonly<{
  contract: Contract;
  title: string;
  eyebrow: string;
  action: (formData: FormData) => Promise<unknown>;
  submitLabel: string;
  onClose: () => void;
}>) {
  return (
    <ContractDialog title={title} eyebrow={eyebrow} onClose={onClose}>
      <SafeActionForm action={action} onSuccess={onClose} className="mt-5 space-y-5">
        <input type="hidden" name="id" value={contract.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-300">Data</span>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="min-h-11 rounded-lg border border-line bg-white/[0.035] px-3 text-sm text-white outline-none transition focus:border-brand-400/60 focus:shadow-focus"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-300">Motivo</span>
            <input
              name="reason"
              maxLength={500}
              placeholder={contract.recurring ? "Ex.: cliente cancelou recorrencia" : "Ex.: projeto avulso cancelado"}
              className="min-h-11 rounded-lg border border-line bg-white/[0.035] px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-brand-400/60 focus:shadow-focus"
            />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-300">Observacoes</span>
          <textarea
            name="notes"
            maxLength={2000}
            rows={4}
            placeholder="Contexto comercial, tentativa de retencao ou proxima acao"
            className="rounded-lg border border-line bg-white/[0.035] px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-brand-400/60 focus:shadow-focus"
          />
        </label>
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-3 text-sm text-zinc-200">
          {contract.recurring
            ? "Este contrato possui receita recorrente. Se for cancelado ou nao renovado, o MRR perdido entrara nas metricas de churn."
            : "Este contrato possui apenas receita avulsa. O cancelamento nao entra no churn de MRR."}
        </div>
        <ContractDialogFooter onClose={onClose} submitLabel={submitLabel} />
      </SafeActionForm>
    </ContractDialog>
  );
}
