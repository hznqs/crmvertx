"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type ModuleSearchProps = {
  placeholder: string;
  defaultValue: string;
};

export function ModuleSearch({ placeholder, defaultValue }: ModuleSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateSearch(value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    nextParams.set("page", "0");

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`);
    });
  }

  return (
    <div className="space-y-2">
      <input
        defaultValue={defaultValue}
        onChange={(event) => updateSearch(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
      />
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}
