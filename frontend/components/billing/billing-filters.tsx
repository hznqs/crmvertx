"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DatePicker } from "@/components/ui/date-picker";

export function BillingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function updateFilter(name: "from" | "to", value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <DatePicker value={from} onChange={(value) => updateFilter("from", value)} />
        <DatePicker value={to} onChange={(value) => updateFilter("to", value)} />
      </div>
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}
