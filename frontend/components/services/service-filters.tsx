"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PremiumSelect } from "@/components/ui/premium-select";
import { serviceBillingTypeLabels, serviceCategoryLabels } from "@/lib/services/labels";
import type { ServiceQuery } from "@/lib/types/services";

type ServiceFiltersProps = {
  query: ServiceQuery;
};

export function ServiceFilters({ query }: ServiceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof ServiceQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row">
        <input
          defaultValue={query.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Buscar por nome, descricao, checklist ou etapas"
          className="min-h-11 flex-1 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <PremiumSelect value={query.category} onChange={(value) => updateFilter("category", value)} placeholder="Categorias" options={[{ value: "", label: "Categorias" }, ...Object.entries(serviceCategoryLabels).map(([value, label]) => ({ value, label }))]} />
          <PremiumSelect value={query.billingType} onChange={(value) => updateFilter("billingType", value)} placeholder="Cobranca" options={[{ value: "", label: "Cobranca" }, ...Object.entries(serviceBillingTypeLabels).map(([value, label]) => ({ value, label }))]} />
          <PremiumSelect value={query.active} onChange={(value) => updateFilter("active", value)} placeholder="Todos" options={[{ value: "", label: "Todos" }, { value: "true", label: "Ativos" }, { value: "false", label: "Inativos" }]} />
        </div>
      </div>
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}
