"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { UserRole } from "@/lib/auth/permissions";
import { useUiStore } from "@/lib/store/ui-store";

const CommandPalette = dynamic(
  () => import("@/components/app/command-palette").then((module) => module.CommandPalette),
  { ssr: false }
);

export function Providers({
  children,
  role
}: Readonly<{ children: React.ReactNode; role: UserRole | null }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1
          },
          mutations: {
            retry: 0
          }
        }
      })
  );
  const toggleCommand = useUiStore((state) => state.toggleCommand);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleCommand();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommand]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <CommandPalette role={role} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
