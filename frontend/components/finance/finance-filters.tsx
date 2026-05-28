"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { PremiumSelect } from "@/components/ui/premium-select";
import { financeStatusLabels, financeTypeLabels } from "@/lib/finance/labels";
import type { FinanceQuery } from "@/lib/types/finance";

type FinanceFiltersProps = {
  query: FinanceQuery;
};

export function FinanceFilters({ query }: FinanceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof FinanceQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 md:grid-cols-5">
        <PremiumSelect value={query.type} onChange={(value) => updateFilter("type", value)} placeholder="Todos os tipos" options={[{ value: "", label: "Todos os tipos" }, ...toOptions(financeTypeLabels)]} />
        <PremiumSelect value={query.status} onChange={(value) => updateFilter("status", value)} placeholder="Todos os status" options={[{ value: "", label: "Todos os status" }, ...toOptions(financeStatusLabels)]} />
        <DatePicker value={query.from} onChange={(value) => updateFilter("from", value)} />
        <DatePicker value={query.to} onChange={(value) => updateFilter("to", value)} />
        <PremiumSelect value={String(query.size)} onChange={(value) => updateFilter("size", value)} options={pageSizeOptions} />
      </div>
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}

const pageSizeOptions = [{ value: "25", label: "25" }, { value: "50", label: "50" }, { value: "100", label: "100" }];

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}
