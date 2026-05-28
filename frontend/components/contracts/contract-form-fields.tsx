import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { contractStatusLabels } from "@/lib/contracts/labels";
import type { Contract, ContractSelectOption } from "@/lib/types/contracts";

type ContractFormFieldsProps = {
  contract?: Contract;
  clientOptions: ContractSelectOption[];
  serviceOptions: ContractSelectOption[];
  projectOptions: ContractSelectOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function ContractFormFields({
  contract,
  clientOptions,
  serviceOptions,
  projectOptions
}: ContractFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Plano">
          <input name="plan" required defaultValue={contract?.plan ?? ""} className={inputClassName} />
        </Field>
        <Field label="Cliente">
          <PremiumSelect name="clientId" defaultValue={contract?.clientId ?? ""} placeholder="Nao vinculado" options={selectOptions(clientOptions)} searchable />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Servico">
          <PremiumSelect name="serviceId" defaultValue={contract?.serviceId ?? ""} placeholder="Nao vinculado" options={selectOptions(serviceOptions)} searchable />
        </Field>
        <Field label="Projeto">
          <PremiumSelect name="projectId" defaultValue={contract?.projectId ?? ""} placeholder="Nao vinculado" options={selectOptions(projectOptions)} searchable />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={contract?.status ?? "ativo"} options={toOptions(contractStatusLabels)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Inicio">
          <DatePicker name="startDate" required defaultValue={contract?.startDate ?? ""} />
        </Field>
        <Field label="Termino">
          <DatePicker name="endDate" required defaultValue={contract?.endDate ?? ""} />
        </Field>
        <Field label="Duracao">
          <FormattedInput name="durationMonths" mask="integer" required defaultValue={contract?.durationMonths ?? 1} />
        </Field>
        <Field label="Vencimento">
          <FormattedInput name="billingDueDay" mask="integer" defaultValue={contract?.billingDueDay ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Mensalidade">
          <FormattedInput name="monthlyValue" mask="currency" defaultValue={contract?.monthlyValue ?? 0} />
        </Field>
        <Field label="Valor total">
          <FormattedInput name="totalValue" mask="currency" defaultValue={contract?.totalValue ?? 0} />
        </Field>
        <Field label="Renovacao">
          <PremiumSelect name="autoRenew" defaultValue={contract?.autoRenew ? "true" : "false"} options={[{ value: "true", label: "Automatica" }, { value: "false", label: "Manual" }]} />
        </Field>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={contract?.active === false ? "false" : "true"} options={booleanOptions("Ativo", "Inativo")} />
        </Field>
      </div>
    </div>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function selectOptions(options: ContractSelectOption[]) {
  return [{ value: "", label: "Nao vinculado" }, ...options.map((option) => ({ value: option.id, label: option.label }))];
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
