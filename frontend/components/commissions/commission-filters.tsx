"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { CommissionQuery, CommissionSelectOption } from "@/lib/types/commissions";

type CommissionFiltersProps = {
  query: CommissionQuery;
  memberOptions: CommissionSelectOption[];
};

export function CommissionFilters({ query, memberOptions }: CommissionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof CommissionQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_140px]">
        <PremiumSelect value={query.memberId} onChange={(value) => updateFilter("memberId", value)} placeholder="Todos os membros" options={[{ value: "", label: "Todos os membros" }, ...memberOptions.map((member) => ({ value: member.id, label: member.label }))]} searchable />
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
