"use client";

import { AppNavigation } from "@/components/app/app-navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Bell, Command, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/auth/session";
import { useUiStore } from "@/lib/store/ui-store";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  user: SessionUser | null;
}>;

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);

  if (pathname === "/login") {
    return children;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    toast.success("Sessao encerrada com seguranca.");
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-brand-400/10 bg-[#090909] p-4 shadow-[18px_0_80px_rgba(0,0,0,.34)] lg:block">
        <Link href="/dashboard" className="mb-7 inline-flex h-16 items-center px-1">
          <BrandLogo variant="full" size="lg" className="h-14 w-60" priority />
        </Link>

        <AppNavigation role={user?.role ?? null} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-brand-400/10 bg-[#090909]/88 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,.22)] backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo variant="mark" size="sm" className="hidden md:inline-flex h-10 w-10" />
              <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Plataforma operacional
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                CRM, projetos, financeiro e performance
              </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden min-h-10 min-w-[280px] items-center gap-3 rounded-crm border border-line bg-white/[0.045] px-3 text-left text-sm text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] transition duration-premium ease-premium hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-zinc-200 focus-visible:shadow-focus lg:flex"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="flex-1">Buscar ou executar comando</span>
              <kbd className="rounded border border-brand-400/15 bg-brand-500/10 px-2 py-1 text-[10px] font-bold text-fuchsia-100">
                Ctrl K
              </kbd>
            </button>
            <div className="hidden items-center gap-2 md:flex">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => toast.info("Central de notificacoes pronta para realtime.")}
                aria-label="Abrir notificacoes"
              >
                <Bell className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCommandOpen(true)}
                aria-label="Abrir command palette"
              >
                <Command className="h-4 w-4" aria-hidden />
              </Button>
              <Link
                href="/profile"
                className="rounded-crm border border-line bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition duration-premium ease-premium hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-white focus-visible:shadow-focus"
              >
                {user?.role ? `Perfil ${user.role}` : "Sessao protegida"}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-9 items-center gap-2 rounded-crm border border-line bg-white/[0.045] px-3 py-2 text-xs font-semibold text-zinc-300 transition duration-premium ease-premium hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-100 focus-visible:shadow-focus"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
