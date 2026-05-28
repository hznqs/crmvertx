"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { PerformanceClientOption, PerformanceQuery } from "@/lib/types/performance";

type PerformanceFiltersProps = {
  query: PerformanceQuery;
  clientOptions: PerformanceClientOption[];
};

export function PerformanceFilters({ query, clientOptions }: PerformanceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof PerformanceQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_140px]">
        <PremiumSelect value={query.clientId} onChange={(value) => updateFilter("clientId", value)} placeholder="Todos os clientes" options={[{ value: "", label: "Todos os clientes" }, ...clientOptions.map((client) => ({ value: client.id, label: client.label }))]} searchable />
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

const pageSizeOptions = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" }
];
