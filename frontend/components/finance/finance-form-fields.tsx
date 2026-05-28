import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { costCenterLabels, financeStatusLabels, financeTypeLabels } from "@/lib/finance/labels";
import type { FinanceEntry, FinanceSelectOption } from "@/lib/types/finance";

type FinanceFormFieldsProps = {
  entry?: FinanceEntry;
  clientOptions: FinanceSelectOption[];
  contractOptions: FinanceSelectOption[];
  projectOptions: FinanceSelectOption[];
  serviceOptions: FinanceSelectOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function FinanceFormFields({
  entry,
  clientOptions,
  contractOptions,
  projectOptions,
  serviceOptions
}: FinanceFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <Field label="Descricao">
          <input name="description" required defaultValue={entry?.description ?? ""} className={inputClassName} />
        </Field>
        <Field label="Tipo">
          <PremiumSelect name="type" required defaultValue={entry?.type ?? "receita"} options={toOptions(financeTypeLabels)} />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={entry?.status ?? "pendente"} options={toOptions(financeStatusLabels)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Valor">
          <FormattedInput name="value" mask="currency" defaultValue={entry?.value ?? 0} />
        </Field>
        <Field label="Vencimento">
          <DatePicker name="due" required defaultValue={entry?.due ?? ""} />
        </Field>
        <Field label="Centro de custo">
          <PremiumSelect name="costCenter" required defaultValue={entry?.costCenter ?? "operacional"} options={toOptions(costCenterLabels)} />
        </Field>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={entry?.active === false ? "false" : "true"} options={booleanOptions("Ativo", "Inativo")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Cliente">
          <OptionSelect name="clientId" value={entry?.clientId} options={clientOptions} />
        </Field>
        <Field label="Contrato">
          <OptionSelect name="contractId" value={entry?.contractId} options={contractOptions} />
        </Field>
        <Field label="Projeto">
          <OptionSelect name="projectId" value={entry?.projectId} options={projectOptions} />
        </Field>
        <Field label="Servico">
          <OptionSelect name="serviceId" value={entry?.serviceId} options={serviceOptions} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Recorrente">
          <PremiumSelect name="recurring" defaultValue={entry?.recurring ? "true" : "false"} options={booleanOptions("Sim", "Nao")} />
        </Field>
        <Field label="Cobranca automatica">
          <PremiumSelect name="autoBilling" defaultValue={entry?.autoBilling ? "true" : "false"} options={booleanOptions("Sim", "Nao")} />
        </Field>
      </div>
    </div>
  );
}

function OptionSelect({
  name,
  value,
  options
}: Readonly<{
  name: string;
  value: string | null | undefined;
  options: FinanceSelectOption[];
}>) {
  return (
    <PremiumSelect name={name} defaultValue={value ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...options.map((option) => ({ value: option.id, label: option.label }))]} searchable />
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function booleanOptions(trueLabel: string, falseLabel: string) {
  return [{ value: "true", label: trueLabel }, { value: "false", label: falseLabel }];
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
