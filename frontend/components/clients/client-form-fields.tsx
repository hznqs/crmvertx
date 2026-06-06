import {
  clientPhaseLabels,
  clientPriorityLabels,
  clientStatusLabels,
  documentTypeLabels
} from "@/lib/clients/labels";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { Client } from "@/lib/types/clients";

type ClientFormFieldsProps = {
  client?: Client;
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function ClientFormFields({ client }: ClientFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Empresa">
          <input name="name" required defaultValue={client?.name ?? ""} className={inputClassName} />
        </Field>
        <Field label="Responsavel">
          <input name="contact" required defaultValue={client?.contact ?? ""} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Fase">
          <PremiumSelect name="phase" required defaultValue={client?.phase ?? "fechado"} options={toOptions(clientPhaseLabels)} />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={client?.status ?? "ATIVO"} options={toOptions(clientStatusLabels)} />
        </Field>
        <Field label="Prioridade">
          <PremiumSelect name="priority" required defaultValue={client?.priority ?? "MEDIA"} options={toOptions(clientPriorityLabels)} />
        </Field>
        <Field label="Tipo">
          <PremiumSelect
            name="clientType"
            required
            defaultValue={client?.clientType ?? "JURIDICA"}
            options={[
              { value: "JURIDICA", label: "Pessoa juridica" },
              { value: "FISICA", label: "Pessoa fisica" }
            ]}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email">
          <FormattedInput name="email" mask="email" defaultValue={client?.email ?? ""} placeholder="contato@empresa.com" />
        </Field>
        <Field label="Telefone">
          <FormattedInput name="phone" mask="phone" defaultValue={client?.phone ?? ""} placeholder="(11) 99999-9999" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Segmento">
          <input name="segment" defaultValue={client?.segment ?? ""} className={inputClassName} />
        </Field>
        <Field label="Origem">
          <input name="origin" defaultValue={client?.origin ?? ""} className={inputClassName} placeholder="Lead, indicacao, outbound..." />
        </Field>
        <Field label="Responsavel interno">
          <input name="responsibleName" defaultValue={client?.responsibleName ?? ""} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Documento">
          <FormattedInput name="document" mask="cpfCnpj" defaultValue={client?.document ?? ""} placeholder="CPF ou CNPJ" />
        </Field>
        <Field label="Tipo documento">
          <PremiumSelect name="documentType" defaultValue={client?.documentType ?? "NAO_INFORMADO"} options={toOptions(documentTypeLabels)} />
        </Field>
        <Field label="Tags">
          <input name="tags" defaultValue={client?.tags ?? ""} className={inputClassName} placeholder="vip, mensalista" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Rua">
          <input name="addressStreet" defaultValue={client?.addressStreet ?? ""} className={inputClassName} />
        </Field>
        <Field label="Numero">
          <input name="addressNumber" defaultValue={client?.addressNumber ?? ""} className={inputClassName} />
        </Field>
        <Field label="Cidade">
          <input name="addressCity" defaultValue={client?.addressCity ?? ""} className={inputClassName} />
        </Field>
        <Field label="UF">
          <input name="addressState" maxLength={2} defaultValue={client?.addressState ?? ""} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Complemento">
          <input name="addressComplement" defaultValue={client?.addressComplement ?? ""} className={inputClassName} />
        </Field>
        <Field label="Bairro">
          <input name="addressDistrict" defaultValue={client?.addressDistrict ?? ""} className={inputClassName} />
        </Field>
        <Field label="CEP">
          <FormattedInput name="addressZipCode" mask="cep" defaultValue={client?.addressZipCode ?? ""} placeholder="00000-000" />
        </Field>
      </div>

      <Field label="Observacoes">
        <textarea
          name="notes"
          defaultValue={client?.notes ?? ""}
          className={`${inputClassName} min-h-28 py-3`}
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
