import {
  commercialStageLabels,
  leadOriginLabels,
  leadStatusLabels,
  leadTemperatureLabels
} from "@/lib/leads/labels";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { Lead } from "@/lib/types/leads";

type LeadFormFieldsProps = {
  lead?: Lead;
  mode: "create" | "edit";
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function LeadFormFields({ lead, mode }: LeadFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome">
          <input
            name="name"
            required
            defaultValue={lead?.name ?? ""}
            className={inputClassName}
            placeholder="Nome do lead"
          />
        </Field>

        <Field label="Empresa">
          <input
            name="companyName"
            defaultValue={lead?.companyName ?? ""}
            className={inputClassName}
            placeholder="Empresa"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email">
          <FormattedInput name="email" mask="email" defaultValue={lead?.email ?? ""} placeholder="lead@empresa.com" />
        </Field>

        <Field label="Telefone">
          <FormattedInput name="phone" mask="phone" defaultValue={lead?.phone ?? ""} placeholder="(00) 00000-0000" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Origem">
          <PremiumSelect name="origin" required defaultValue={lead?.origin ?? "SITE"} options={toOptions(leadOriginLabels)} />
        </Field>

        <Field label="Temperatura">
          <PremiumSelect name="temperature" required defaultValue={lead?.temperature ?? "MORNO"} options={toOptions(leadTemperatureLabels)} />
        </Field>

        <Field label="Valor potencial">
          <FormattedInput name="potentialValue" mask="currency" required defaultValue={lead?.potentialValue ?? 0} />
        </Field>
      </div>

      <Field label="Segmento">
        <input
          name="segment"
          defaultValue={lead?.segment ?? ""}
          className={inputClassName}
          placeholder="Ex.: SaaS, clinica, e-commerce"
        />
      </Field>

      {mode === "edit" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Status">
            <PremiumSelect name="status" required defaultValue={lead?.status ?? "ACTIVE"} options={toOptions(leadStatusLabels)} />
          </Field>

          <Field label="Fase comercial">
            <PremiumSelect name="commercialStage" required defaultValue={lead?.commercialStage ?? "NOVO"} options={toOptions(commercialStageLabels)} />
          </Field>

          <Field label="Motivo de perda">
            <input
              name="lostReason"
              defaultValue={lead?.lostReason ?? ""}
              className={inputClassName}
              placeholder="Obrigatorio se perdido"
            />
          </Field>
        </div>
      ) : null}

      <Field label="Observacoes">
        <textarea
          name="notes"
          defaultValue={lead?.notes ?? ""}
          className={`${inputClassName} min-h-28 py-3`}
          placeholder="Contexto comercial, dores, proximos passos..."
        />
      </Field>
    </div>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function Field({
  label,
  children
}: Readonly<{
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
