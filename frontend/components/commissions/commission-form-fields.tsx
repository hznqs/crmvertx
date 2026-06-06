import { commissionStatusLabels, commissionTypeLabels } from "@/lib/commissions/labels";
import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { CommissionSale, CommissionSelectOption } from "@/lib/types/commissions";

type CommissionFormFieldsProps = {
  commission?: CommissionSale;
  memberOptions: CommissionSelectOption[];
  contractOptions: CommissionSelectOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function CommissionFormFields({ commission, memberOptions, contractOptions }: CommissionFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Membro">
          <PremiumSelect name="memberId" required defaultValue={commission?.memberId ?? ""} placeholder="Selecione" options={selectOptions(memberOptions, "Selecione")} searchable />
        </Field>
        <Field label="Tipo">
          <PremiumSelect name="type" required defaultValue={commission?.type ?? "VENDA"} options={toOptions(commissionTypeLabels)} />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={commission?.status ?? "PENDENTE"} options={toOptions(commissionStatusLabels)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Cliente">
          <input name="client" defaultValue={commission?.client ?? ""} className={inputClassName} />
        </Field>
        <Field label="Contrato">
          <PremiumSelect name="contractId" defaultValue={commission?.contractId ?? ""} placeholder="Nao vinculado" options={selectOptions(contractOptions, "Nao vinculado")} searchable />
        </Field>
        <input type="hidden" name="clientId" value={commission?.clientId ?? ""} />
        <input type="hidden" name="financeEntryId" value={commission?.financeEntryId ?? ""} />
        <Field label="Ativa">
          <PremiumSelect name="active" defaultValue={commission?.active === false ? "false" : "true"} options={booleanOptions("Ativa", "Inativa")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Calculo">
          <PremiumSelect
            name="calculationType"
            required
            defaultValue={commission?.calculationType ?? "PERCENTUAL"}
            options={[
              { value: "PERCENTUAL", label: "Percentual" },
              { value: "FIXA", label: "Valor fixo" }
            ]}
          />
        </Field>
        <Field label="Valor da venda">
          <FormattedInput name="value" mask="currency" defaultValue={commission?.value ?? 0} />
        </Field>
        <Field label="Percentual">
          <FormattedInput name="percent" mask="percentage" defaultValue={commission?.percent ?? 0} />
        </Field>
        <Field label="Valor fixo">
          <FormattedInput name="fixedValue" mask="currency" defaultValue={commission?.fixedValue ?? 0} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Mes de referencia">
          <DatePicker name="referenceMonth" defaultValue={commission?.referenceMonth ?? ""} />
        </Field>
        <Field label="Meta">
          <FormattedInput name="goal" mask="integer" defaultValue={commission?.goal ?? 0} />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function selectOptions(options: CommissionSelectOption[], emptyLabel: string) {
  return [{ value: "", label: emptyLabel }, ...options.map((option) => ({ value: option.id, label: option.label }))];
}

function booleanOptions(trueLabel: string, falseLabel: string) {
  return [{ value: "true", label: trueLabel }, { value: "false", label: falseLabel }];
}
