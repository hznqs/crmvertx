"use client";

import { Check, GitBranch, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { contractStatusLabels } from "@/lib/contracts/labels";
import { formatCurrency } from "@/lib/formatters";
import type { Contract, ContractSelectOption } from "@/lib/types/contracts";
import type { ServiceBillingType } from "@/lib/types/services";

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
  const allServiceOptions = useMemo(
    () => mergeServiceOptions(serviceOptions, contract),
    [contract, serviceOptions]
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState(() => initialServiceIds(contract));
  const [period, setPeriod] = useState(() => ({
    startDate: contract?.startDate ?? "",
    endDate: contract?.endDate ?? ""
  }));
  const [financial, setFinancial] = useState(() => ({
    implementationFee: numberValue(contract?.implementationFee),
    discount: numberValue(contract?.discount)
  }));

  const selectedServices = useMemo(
    () => selectedServiceIds
      .map((serviceId) => allServiceOptions.find((service) => service.id === serviceId))
      .filter((service): service is ContractSelectOption => Boolean(service)),
    [allServiceOptions, selectedServiceIds]
  );

  const financialSummary = useMemo(() => {
    const hasRecurringServices = selectedServices.some((service) => !isOneTimeService(service.billingType));
    const hasOneTimeServices = selectedServices.some((service) => isOneTimeService(service.billingType));
    const deliveryDays = deliveryDaysBetween(period.startDate, period.endDate);
    const durationMonths = hasRecurringServices ? recurringMonthsBetween(period.startDate, period.endDate) : 0;
    const monthlyValue = selectedServices
      .filter((service) => !isOneTimeService(service.billingType))
      .reduce((total, service) => total + numberValue(service.basePrice), 0);
    const oneTimeServicesValue = selectedServices
      .filter((service) => isOneTimeService(service.billingType))
      .reduce((total, service) => total + numberValue(service.basePrice), 0);
    const recurringTotal = monthlyValue * durationMonths;
    const grossTotal = recurringTotal + oneTimeServicesValue + financial.implementationFee;
    const total = Math.max(0, grossTotal - financial.discount);
    const dateError = period.startDate && period.endDate && parseIsoDate(period.endDate) < parseIsoDate(period.startDate)
      ? "Data de termino nao pode ser anterior a data de inicio."
      : "";
    const durationError = hasRecurringServices && period.startDate && period.endDate && !dateError && durationMonths < 1
      ? "Contratos recorrentes precisam ter duracao minima de 1 mes."
      : "";
    const discountError = financial.discount > grossTotal
      ? "Desconto nao pode ser maior que o valor bruto do contrato."
      : "";
    const serviceError = selectedServices.length === 0
      ? "Selecione pelo menos um servico ativo para o contrato."
      : "";

    return {
      hasRecurringServices,
      hasOneTimeServices,
      deliveryDays,
      durationMonths,
      monthlyValue,
      oneTimeServicesValue,
      recurringTotal,
      grossTotal,
      total,
      dateError,
      durationError,
      discountError,
      serviceError
    };
  }, [financial, period, selectedServices]);

  const updateFinancial = (field: keyof typeof financial, value: string) => {
    setFinancial((current) => {
      return { ...current, [field]: numberValue(value) };
    });
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) => current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId]
    );
  };

  return (
    <div className="grid gap-4">
      {selectedServiceIds.map((serviceId) => (
        <input key={serviceId} type="hidden" name="serviceIds" value={serviceId} />
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Plano">
          <input name="plan" required defaultValue={contract?.plan ?? ""} className={inputClassName} />
        </Field>
        <Field label="Cliente">
          <PremiumSelect name="clientId" required defaultValue={contract?.clientId ?? ""} placeholder="Selecione um cliente" options={selectOptions(clientOptions, "Selecione um cliente")} searchable />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Responsavel / vendedor">
          <input name="sellerName" defaultValue={contract?.sellerName ?? ""} className={inputClassName} />
        </Field>
        <Field label="Forma de pagamento">
          <PremiumSelect
            name="paymentMethod"
            defaultValue={contract?.paymentMethod ?? ""}
            placeholder="Nao informada"
            options={[
              { value: "", label: "Nao informada" },
              { value: "pix", label: "Pix" },
              { value: "boleto", label: "Boleto" },
              { value: "cartao", label: "Cartao" },
              { value: "transferencia", label: "Transferencia" },
              { value: "dinheiro", label: "Dinheiro" }
            ]}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Projeto">
          <PremiumSelect name="projectId" defaultValue={contract?.projectId ?? ""} placeholder="Nao vinculado" options={selectOptions(projectOptions, "Nao vinculado")} searchable />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={contract?.status ?? "ativo"} options={toOptions(contractStatusLabels)} />
        </Field>
      </div>

      <div className="rounded-xl border border-brand-500/20 bg-[#090909]/80 p-4 shadow-[0_0_32px_rgba(106,13,173,.10)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">Servicos do contrato</p>
            <p className="mt-1 text-sm text-muted">Os valores vêm do cadastro de servicos e serao salvos como snapshot no contrato.</p>
          </div>
          <span className="rounded-full border border-brand-400/25 bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-100">
            {selectedServices.length} selecionado{selectedServices.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {allServiceOptions.length ? allServiceOptions.map((service) => {
            const selected = selectedServiceIds.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={`group flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                  selected
                    ? "border-brand-400/60 bg-brand-500/15 shadow-[0_0_28px_rgba(234,89,220,.12)]"
                    : "border-line bg-white/[0.035] hover:border-brand-400/35 hover:bg-white/[0.055]"
                }`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
                  selected ? "border-brand-300/40 bg-brand-500/20 text-brand-100" : "border-line bg-white/[0.035] text-zinc-500"
                }`}>
                  {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-white">{service.label}</span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {formatCurrency(service.basePrice ?? 0)} · {billingTypeLabel(service.billingType)}
                  </span>
                </span>
              </button>
            );
          }) : (
            <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted md:col-span-2">
              Cadastre servicos ativos antes de criar contratos.
            </div>
          )}
        </div>

        {selectedServices.length ? (
          <div className="mt-4 grid gap-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{service.label}</p>
                  <p className="text-xs text-zinc-500">{billingTypeLabel(service.billingType)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <strong className="text-sm text-white">{formatCurrency(service.basePrice ?? 0)}</strong>
                  <button type="button" onClick={() => toggleService(service.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-zinc-400 transition hover:border-rose-300/40 hover:text-rose-100" aria-label={`Remover ${service.label}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Inicio">
          <DatePicker
            name="startDate"
            required
            value={period.startDate}
            onChange={(value) => setPeriod((current) => ({ ...current, startDate: value }))}
          />
        </Field>
        <Field label="Termino">
          <DatePicker
            name="endDate"
            required
            value={period.endDate}
            onChange={(value) => setPeriod((current) => ({ ...current, endDate: value }))}
          />
        </Field>
        <input type="hidden" name="durationMonths" value={financialSummary.durationMonths} />
        <Field label={financialSummary.hasRecurringServices ? "Duracao do contrato" : "Prazo de entrega"}>
          <input
            readOnly
            value={durationDisplay(financialSummary)}
            className={`${inputClassName} cursor-not-allowed bg-white/[0.025] text-zinc-300`}
            aria-label={financialSummary.hasRecurringServices ? "Duracao do contrato" : "Prazo de entrega"}
          />
        </Field>
        <Field label="Vencimento">
          <FormattedInput name="billingDueDay" mask="integer" defaultValue={contract?.billingDueDay ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Taxa de Implementacao">
          <FormattedInput
            name="implementationFee"
            mask="currency"
            defaultValue={contract?.implementationFee ?? 0}
            onValueChange={(value) => updateFinancial("implementationFee", value)}
          />
        </Field>
        <Field label="Desconto">
          <FormattedInput
            name="discount"
            mask="currency"
            defaultValue={contract?.discount ?? 0}
            onValueChange={(value) => updateFinancial("discount", value)}
          />
        </Field>
        <Field label="Renovacao">
          <PremiumSelect name="autoRenew" defaultValue={contract?.autoRenew ? "true" : "false"} options={[{ value: "true", label: "Automatica" }, { value: "false", label: "Manual" }]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="rounded-xl border border-brand-500/25 bg-[#090909]/80 p-4 shadow-[0_0_32px_rgba(106,13,173,.12)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">Resumo financeiro</p>
              <p className="mt-2 text-sm text-muted">Mensalidade e valor final sao calculados pelos servicos selecionados. O backend recalcula ao salvar.</p>
            </div>
            <div className="rounded-lg border border-brand-500/30 bg-brand-950/30 px-4 py-3 text-right">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Valor total</span>
              <strong className="mt-1 block text-2xl text-white">{formatCurrency(financialSummary.total)}</strong>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
            <SummaryItem label="Mensalidade" value={formatCurrency(financialSummary.monthlyValue)} />
            <SummaryItem label="Duracao recorrente" value={`${financialSummary.durationMonths} mes${financialSummary.durationMonths === 1 ? "" : "es"}`} />
            <SummaryItem label="Total recorrente" value={formatCurrency(financialSummary.recurringTotal)} />
            <SummaryItem label="Servicos avulsos" value={formatCurrency(financialSummary.oneTimeServicesValue)} />
            <SummaryItem label="Implementacao" value={formatCurrency(financial.implementationFee)} />
            <SummaryItem label="Desconto" value={`-${formatCurrency(financial.discount)}`} />
          </div>
          {financialSummary.hasOneTimeServices ? (
            <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-300">
              Prazo de entrega do projeto: <strong className="text-white">{financialSummary.deliveryDays} dia{financialSummary.deliveryDays === 1 ? "" : "s"}</strong>. Servicos avulsos entram uma unica vez no total.
            </p>
          ) : null}
          {financialSummary.dateError ? (
            <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100">
              {financialSummary.dateError}
            </p>
          ) : null}
          {financialSummary.durationError ? (
            <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100">
              {financialSummary.durationError}
            </p>
          ) : null}
          {financialSummary.serviceError ? (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-100">
              {financialSummary.serviceError}
            </p>
          ) : null}
          {financialSummary.discountError ? (
            <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100">
              {financialSummary.discountError}
            </p>
          ) : null}
          <input
            aria-hidden="true"
            className="pointer-events-none absolute size-px opacity-0"
            name="financialValidation"
            required
            tabIndex={-1}
            value={financialSummary.dateError || financialSummary.durationError || financialSummary.discountError || financialSummary.serviceError ? "" : "ok"}
            onChange={() => undefined}
          />
        </div>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={contract?.active === false ? "false" : "true"} options={booleanOptions("Ativo", "Inativo")} />
        </Field>
      </div>

      <div className="rounded-xl border border-brand-500/25 bg-[#090909]/80 p-4 shadow-[0_0_30px_rgba(234,89,220,.10)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-400/30 bg-brand-500/15 text-brand-100">
              <GitBranch className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Operacao do contrato</p>
              <p className="mt-1 text-sm text-muted">
                Gere um projeto operacional somente quando o contrato estiver pronto para execucao. O backend evita projetos duplicados.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-100">
                Estimativa: {Math.max(1, selectedServices.length) * 6} tarefas a partir dos templates dos servicos
              </p>
            </div>
          </div>
          {contract?.projectId ? (
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-100">
              Projeto vinculado
            </span>
          ) : (
            <label className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-brand-400/35 hover:bg-brand-500/10">
              <input
                type="checkbox"
                name="generateProject"
                value="true"
                className="h-4 w-4 rounded border-line bg-[#090909] accent-[#ea59dc]"
              />
              Gerar projeto ao salvar
            </label>
          )}
        </div>
      </div>

      <Field label="Observacoes">
        <textarea
          name="notes"
          defaultValue={contract?.notes ?? ""}
          className={`${inputClassName} min-h-24 py-3`}
          placeholder="Condicoes comerciais, alinhamentos e observacoes internas"
        />
      </Field>
    </div>
  );
}

function SummaryItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</span>
      <strong className="mt-1 block text-white">{value}</strong>
    </div>
  );
}

function numberValue(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return 0;
  const numericValue = rawValue.replace(/[^\d,.-]/g, "");
  const normalized = numericValue.includes(",")
    ? numericValue.replace(/\./g, "").replace(",", ".")
    : numericValue;
  const number = Number(normalized ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function selectOptions(options: ContractSelectOption[], emptyLabel: string) {
  return [{ value: "", label: emptyLabel }, ...options.map((option) => ({ value: option.id, label: option.label }))];
}

function booleanOptions(trueLabel: string, falseLabel: string) {
  return [{ value: "true", label: trueLabel }, { value: "false", label: falseLabel }];
}

function initialServiceIds(contract?: Contract) {
  const ids = contract?.serviceIds?.filter(Boolean) ?? [];
  if (ids.length) return ids;
  return contract?.serviceId ? [contract.serviceId] : [];
}

function mergeServiceOptions(serviceOptions: ContractSelectOption[], contract?: Contract) {
  const options = new Map(serviceOptions.map((service) => [service.id, service]));
  contract?.serviceItems?.forEach((item) => {
    if (item.serviceId && !options.has(item.serviceId)) {
      options.set(item.serviceId, {
        id: item.serviceId,
        label: item.serviceName,
        basePrice: numberValue(item.serviceValue),
        billingType: item.billingType,
        active: item.serviceActiveSnapshot
      });
    }
  });
  return Array.from(options.values());
}

function isOneTimeService(billingType?: ServiceBillingType) {
  return billingType === "UNICO";
}

function billingTypeLabel(billingType?: ServiceBillingType) {
  if (billingType === "UNICO") return "Avulso";
  if (billingType === "MENSAL") return "Mensal";
  if (billingType === "RECORRENTE") return "Recorrente";
  return "Mensal personalizado";
}

function durationDisplay(summary: {
  hasRecurringServices: boolean;
  hasOneTimeServices: boolean;
  durationMonths: number;
  deliveryDays: number;
}) {
  if (summary.hasRecurringServices && summary.hasOneTimeServices) {
    return `${summary.durationMonths} mes${summary.durationMonths === 1 ? "" : "es"} / ${summary.deliveryDays} dia${summary.deliveryDays === 1 ? "" : "s"}`;
  }
  if (summary.hasRecurringServices) {
    return `${summary.durationMonths} mes${summary.durationMonths === 1 ? "" : "es"}`;
  }
  return `${summary.deliveryDays} dia${summary.deliveryDays === 1 ? "" : "s"}`;
}

function deliveryDaysBetween(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const diff = parseIsoDate(endDate).getTime() - parseIsoDate(startDate).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

function recurringMonthsBetween(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (end < start) return 0;
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function Field({
  label,
  children
}: Readonly<{
  label: string;
  children: ReactNode;
}>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
