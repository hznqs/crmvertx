"use client";

import { AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { cleanupCrmAction } from "@/lib/admin/cleanup-actions";
import { Button } from "@/components/ui/button";
import { SafeActionForm } from "@/components/ui/safe-action-form";

const CLEANUP_CONFIRMATION = "LIMPAR_DADOS_DO_CRM";

type CleanupMode = "OPERATIONAL" | "BUSINESS";

const cleanupOptions: Array<{
  value: CleanupMode;
  title: string;
  description: string;
  preserves: string;
}> = [
  {
    value: "OPERATIONAL",
    title: "Limpar dados operacionais",
    description: "Remove leads, clientes, contratos, projetos, tarefas, agenda, financeiro, comissoes, metas, documentos e logs operacionais.",
    preserves: "Preserva admin, usuarios, configuracoes, organizacao, servicos, templates e equipe."
  },
  {
    value: "BUSINESS",
    title: "Limpar negocio completo",
    description: "Remove todos os dados operacionais e tambem servicos, templates de tarefas e membros da equipe.",
    preserves: "Preserva admin, usuarios, configuracoes essenciais, organizacao, migrations e estrutura do banco."
  }
];

export function AdminCleanupPanel() {
  const [confirmation, setConfirmation] = useState("");
  const [mode, setMode] = useState<CleanupMode>("OPERATIONAL");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const canSubmit = confirmation.trim() === CLEANUP_CONFIRMATION;
  const selectedOption = useMemo(
    () => cleanupOptions.find((option) => option.value === mode) ?? cleanupOptions[0],
    [mode]
  );

  return (
    <section className="crm-surface-elevated overflow-hidden">
      <div className="border-b border-line bg-[radial-gradient(circle_at_0%_0%,rgba(244,63,94,.16),transparent_18rem)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-rose-200">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Area administrativa
            </p>
            <h2 className="mt-2 text-xl font-black text-white">Limpeza segura de dados</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Use apenas em ambiente local/dev ou apos backup validado. Esta acao limpa registros operacionais sem remover tabelas,
              migrations, usuarios, permissoes ou configuracoes essenciais.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-100">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Admin preservado
          </span>
        </div>
      </div>

      <SafeActionForm
        action={cleanupCrmAction}
        onSuccess={() => {
          setConfirmation("");
          setSuccessMessage("Limpeza concluida com sucesso. Atualize os modulos para ver tabelas e dashboards zerados.");
        }}
        className="space-y-5 p-5"
      >
        {successMessage ? (
          <div role="status" className="rounded-crm border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100">
            {successMessage}
          </div>
        ) : null}

        <fieldset className="grid gap-3 xl:grid-cols-2">
          <legend className="sr-only">Modo de limpeza</legend>
          {cleanupOptions.map((option) => (
            <label
              key={option.value}
              className={[
                "cursor-pointer rounded-crm-xl border p-4 transition duration-premium ease-premium",
                mode === option.value
                  ? "border-brand-400/45 bg-brand-500/15 shadow-[0_0_28px_rgba(234,89,220,.14)]"
                  : "border-line bg-white/[0.035] hover:border-brand-400/30 hover:bg-white/[0.055]"
              ].join(" ")}
            >
              <input
                type="radio"
                name="mode"
                value={option.value}
                checked={mode === option.value}
                onChange={() => setMode(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-black text-white">{option.title}</span>
              <span className="mt-2 block text-sm leading-6 text-muted">{option.description}</span>
              <span className="mt-3 block rounded-lg border border-line bg-[#090909]/45 px-3 py-2 text-xs font-semibold text-zinc-300">
                {option.preserves}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="rounded-crm-xl border border-amber-300/20 bg-amber-500/10 p-4">
          <p className="text-sm font-black text-amber-100">Backup recomendado antes da limpeza</p>
          <p className="mt-2 text-sm leading-6 text-amber-50/80">
            Antes de usar em um banco real, gere um dump do PostgreSQL/Supabase. Exemplo local:
            <code className="mx-1 rounded bg-black/25 px-1.5 py-0.5 text-xs">pg_dump $DATABASE_URL &gt; backup-crm.sql</code>
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
              Digite {CLEANUP_CONFIRMATION}
            </span>
            <input
              name="confirmation"
              value={confirmation}
              onChange={(event) => {
                setSuccessMessage(null);
                setConfirmation(event.target.value);
              }}
              className="crm-control"
              autoComplete="off"
              spellCheck={false}
              placeholder={CLEANUP_CONFIRMATION}
            />
          </label>
          <Button type="submit" variant="danger" size="lg" disabled={!canSubmit} className="w-full lg:w-auto">
            <Trash2 className="h-4 w-4" aria-hidden />
            Executar limpeza
          </Button>
        </div>

        <p className="text-xs leading-5 text-zinc-500">
          Acao selecionada: <strong className="text-zinc-300">{selectedOption.title}</strong>. Em producao, o backend bloqueia por padrao
          e so permite execucao com <code className="rounded bg-white/[0.06] px-1">ENABLE_ADMIN_CLEANUP=true</code>.
        </p>
      </SafeActionForm>
    </section>
  );
}
