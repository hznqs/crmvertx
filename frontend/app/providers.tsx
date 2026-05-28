"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { UserRole } from "@/lib/auth/permissions";
import { crmTheme } from "@/lib/theme/tokens";
import { useUiStore } from "@/lib/store/ui-store";

const CommandPalette = dynamic(
  () => import("@/components/app/command-palette").then((module) => module.CommandPalette),
  { ssr: false }
);

const RealtimeBridge = dynamic(
  () => import("@/components/app/realtime-bridge").then((module) => module.RealtimeBridge),
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
        {role ? <RealtimeBridge /> : null}
        <CommandPalette role={role} />
        <Toaster
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "crm-popover-surface text-white",
              title: "text-white",
              description: "text-zinc-400",
              actionButton: "crm-button-primary",
              cancelButton: "crm-button-secondary",
              closeButton: "border-line bg-white/[0.045] text-zinc-300 hover:bg-brand-500/15 hover:text-white"
            },
            style: {
              background: "color-mix(in srgb, var(--brand-black) 94%, white)",
              border: "1px solid rgba(234,89,220,.14)",
              boxShadow: crmTheme.shadows.popover,
              color: crmTheme.colors.foreground
            }
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
