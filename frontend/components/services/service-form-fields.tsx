import { serviceBillingTypeLabels, serviceCategoryLabels } from "@/lib/services/labels";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { ServiceOffering } from "@/lib/types/services";

type ServiceFormFieldsProps = {
  service?: ServiceOffering;
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function ServiceFormFields({ service }: ServiceFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome">
          <input name="name" required defaultValue={service?.name ?? ""} className={inputClassName} />
        </Field>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={String(service?.active ?? true)} options={booleanOptions("Sim", "Nao")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Categoria">
          <PremiumSelect name="category" required defaultValue={service?.category ?? "OUTRO"} options={toOptions(serviceCategoryLabels)} />
        </Field>
        <Field label="Cobranca">
          <PremiumSelect name="billingType" required defaultValue={service?.billingType ?? "PERSONALIZADO"} options={toOptions(serviceBillingTypeLabels)} />
        </Field>
        <Field label="Preco base">
          <FormattedInput name="basePrice" mask="currency" required defaultValue={service?.basePrice ?? 0} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="SLA dias">
          <FormattedInput name="slaDays" mask="integer" required defaultValue={service?.slaDays ?? 0} />
        </Field>
        <Field label="Horas estimadas">
          <FormattedInput name="estimatedHours" mask="decimal" required defaultValue={service?.estimatedHours ?? 0} />
        </Field>
        <Field label="Comissao %">
          <FormattedInput name="commissionPercentage" mask="percentage" required defaultValue={service?.commissionPercentage ?? 0} />
        </Field>
        <Field label="Margem bruta %">
          <FormattedInput name="grossMarginPercentage" mask="percentage" required defaultValue={service?.grossMarginPercentage ?? 0} />
        </Field>
      </div>

      <Field label="Descricao">
        <textarea name="description" defaultValue={service?.description ?? ""} className={`${inputClassName} min-h-24 py-3`} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Checklist padrao">
          <textarea name="defaultChecklist" defaultValue={service?.defaultChecklist ?? ""} className={`${inputClassName} min-h-32 py-3`} />
        </Field>
        <Field label="Etapas de entrega">
          <textarea name="deliveryStages" defaultValue={service?.deliveryStages ?? ""} className={`${inputClassName} min-h-32 py-3`} />
        </Field>
      </div>
    </div>
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
