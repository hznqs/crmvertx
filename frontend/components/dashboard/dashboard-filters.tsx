"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import type { DashboardQuery } from "@/lib/types/dashboard";

type DashboardFiltersProps = {
  query: DashboardQuery;
};

export function DashboardFilters({ query }: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof DashboardQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <DatePicker value={query.from} onChange={(value) => updateFilter("from", value)} />
        <DatePicker value={query.to} onChange={(value) => updateFilter("to", value)} />
      </div>
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}
