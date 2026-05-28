"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PremiumSelect } from "@/components/ui/premium-select";
import { contractStatusLabels } from "@/lib/contracts/labels";
import type { ContractQuery, ContractSelectOption } from "@/lib/types/contracts";

type ContractFiltersProps = {
  query: ContractQuery;
  clientOptions: ContractSelectOption[];
};

export function ContractFilters({ query, clientOptions }: ContractFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof ContractQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
        <PremiumSelect value={query.clientId} onChange={(value) => updateFilter("clientId", value)} placeholder="Todos os clientes" options={[{ value: "", label: "Todos os clientes" }, ...clientOptions.map((client) => ({ value: client.id, label: client.label }))]} searchable />
        <PremiumSelect value={query.status} onChange={(value) => updateFilter("status", value)} placeholder="Todos os status" options={[{ value: "", label: "Todos os status" }, ...Object.entries(contractStatusLabels).map(([value, label]) => ({ value, label }))]} />
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
