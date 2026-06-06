"use client";

import { AppNavigation } from "@/components/app/app-navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Command, LogOut, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/auth/session";
import { useUiStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  user: SessionUser | null;
}>;

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLElement>(null);
  const sidebarHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);

  if (pathname === "/login" || pathname === "/register") {
    return children;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    toast.success("Sessao encerrada com seguranca.");
    router.replace("/login");
    router.refresh();
  }

  function clearSidebarHoverTimer() {
    if (sidebarHoverTimerRef.current) {
      clearTimeout(sidebarHoverTimerRef.current);
      sidebarHoverTimerRef.current = null;
    }
  }

  function scheduleSidebarExpand() {
    clearSidebarHoverTimer();
    sidebarHoverTimerRef.current = setTimeout(() => setIsSidebarExpanded(true), 120);
  }

  function collapseSidebar() {
    clearSidebarHoverTimer();
    setIsSidebarExpanded(false);
  }

  function collapseSidebarWhenFocusLeaves(event: React.FocusEvent<HTMLElement>) {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement instanceof Node && sidebarRef.current?.contains(nextFocusedElement)) {
      return;
    }

    collapseSidebar();
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-ink text-white">
      <aside
        ref={sidebarRef}
        aria-label="Navegacao principal"
        onMouseEnter={scheduleSidebarExpand}
        onMouseLeave={collapseSidebar}
        onFocusCapture={() => setIsSidebarExpanded(true)}
        onBlurCapture={collapseSidebarWhenFocusLeaves}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden overflow-visible border-r border-brand-400/10 bg-[#090909] shadow-[18px_0_80px_rgba(0,0,0,.34)] transition-[width,padding] duration-300 ease-in-out lg:block",
          isSidebarExpanded ? "w-72 p-4" : "w-[88px] px-3 py-4"
        )}
      >
        <Link
          href="/dashboard"
          aria-label="Ir para o dashboard"
          className={cn(
            "mb-7 flex h-16 min-w-0 items-center overflow-hidden rounded-2xl outline-none transition-all duration-300 ease-in-out focus-visible:shadow-focus",
            isSidebarExpanded ? "justify-start px-1" : "justify-center px-0"
          )}
        >
          {isSidebarExpanded ? (
            <BrandLogo variant="full" size="lg" className="h-14 w-60" priority />
          ) : (
            <BrandLogo variant="mark" size="lg" className="h-14 w-14" priority />
          )}
        </Link>

        <AppNavigation role={user?.role ?? null} expanded={isSidebarExpanded} />
      </aside>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu lateral"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative h-full w-[min(86vw,320px)] border-r border-brand-400/15 bg-[#090909] p-4 shadow-[24px_0_80px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/dashboard"
                aria-label="Ir para o dashboard"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="inline-flex h-14 min-w-0 items-center"
              >
                <BrandLogo variant="full" size="md" className="h-12 w-44" priority />
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Fechar menu lateral"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <AppNavigation role={user?.role ?? null} onNavigate={() => setIsMobileSidebarOpen(false)} expanded />
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0 transition-[padding] duration-300 ease-in-out",
          isSidebarExpanded ? "lg:pl-72" : "lg:pl-[88px]"
        )}
      >
        <header className="sticky top-0 z-20 border-b border-brand-400/10 bg-[#090909]/88 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,.22)] backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Abrir menu lateral"
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" aria-hidden />
              </Button>
              <BrandLogo variant="mark" size="sm" className="hidden h-10 w-10 md:inline-flex" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  CRM Interno
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Clientes, projetos, financeiro e equipe
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

        <div className="mx-auto min-w-0 max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
