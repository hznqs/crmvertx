import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { ClientPerformanceRecord, PerformanceClientOption } from "@/lib/types/performance";

type PerformanceFormFieldsProps = {
  record?: ClientPerformanceRecord;
  clientOptions: PerformanceClientOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function PerformanceFormFields({ record, clientOptions }: PerformanceFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1fr_180px_160px]">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-300">Cliente</span>
          <PremiumSelect name="clientId" defaultValue={record?.clientId ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...clientOptions.map((client) => ({ value: client.id, label: client.label }))]} searchable />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-300">Data</span>
          <DatePicker name="date" required defaultValue={record?.date ?? ""} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-300">Ativo</span>
          <PremiumSelect name="active" defaultValue={record?.active === false ? "false" : "true"} options={[{ value: "true", label: "Ativo" }, { value: "false", label: "Inativo" }]} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Leads" name="leads" value={record?.leads ?? 0} />
        <Field label="Vendas" name="sales" value={record?.sales ?? 0} />
        <Field label="Receita" name="revenue" value={record?.revenue ?? 0} />
        <Field label="Investimento" name="investment" value={record?.investment ?? 0} />
      </div>
    </div>
  );
}

function Field({ label, name, value }: { label: string; name: string; value: number | string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      <FormattedInput name={name} mask={name === "revenue" || name === "investment" ? "currency" : "integer"} defaultValue={value} />
    </label>
  );
}
