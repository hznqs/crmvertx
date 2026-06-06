"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  canReadModule,
  type UserRole
} from "@/lib/auth/permissions";
import { navigationItems, navigationSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AppNavigationProps = {
  role: UserRole | null;
  onNavigate?: () => void;
  expanded?: boolean;
};

export function AppNavigation({ role, onNavigate, expanded = true }: AppNavigationProps) {
  const pathname = usePathname();
  const visibleItems = navigationItems.filter((item) => canReadModule(role, item.module));

  return (
    <nav
      className={cn(
        "transition-all duration-300 ease-in-out",
        expanded
          ? "calendar-scrollbar mt-6 max-h-[calc(100vh-128px)] space-y-5 overflow-y-auto overflow-x-hidden pr-1"
          : "mt-4 flex max-h-[calc(100vh-112px)] flex-col items-center gap-2 overflow-visible"
      )}
      aria-label="Menu principal"
    >
      {navigationSections.map((section) => {
        const sectionItems = visibleItems.filter((item) => item.section === section.id);
        if (!sectionItems.length) {
          return null;
        }

        return (
          <div key={section.id} className={cn(expanded ? "min-w-0" : "contents")}>
            {expanded ? (
              <p className="px-3 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-600">
                {section.label}
              </p>
            ) : null}
            <div className={cn(expanded ? "mt-2 space-y-1" : "contents")}>
              {sectionItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onNavigate}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    title={expanded ? undefined : item.label}
                    className={cn(
                      "group/sidebar-item relative flex shrink-0 items-center rounded-crm text-sm font-semibold transition duration-premium ease-premium focus-visible:shadow-focus",
                      expanded ? "min-h-10 gap-3 px-3" : "h-11 w-11 justify-center rounded-2xl p-0",
                      isActive
                        ? cn(
                            "border border-brand-400/15 bg-brand-500/15 text-white shadow-[0_0_28px_rgba(106,13,173,.14)]",
                            expanded ? "shadow-[inset_3px_0_0_rgba(234,89,220,.9),0_0_28px_rgba(106,13,173,.14)]" : "ring-1 ring-brand-400/35"
                          )
                        : "border border-transparent text-zinc-400 hover:border-brand-400/10 hover:bg-brand-500/10 hover:text-white"
                    )}
                  >
                    <Icon className={cn(expanded ? "h-4 w-4" : "h-5 w-5", isActive ? "text-brand-400" : "text-zinc-600 group-hover/sidebar-item:text-brand-300")} aria-hidden />
                    {expanded ? <span className="min-w-0 truncate">{item.label}</span> : null}
                    {!expanded ? (
                      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-brand-400/15 bg-[#141017] px-3 py-2 text-xs font-bold text-white opacity-0 shadow-[0_16px_36px_rgba(0,0,0,.42),0_0_24px_rgba(106,13,173,.18)] transition duration-200 ease-in-out group-hover/sidebar-item:translate-x-0 group-hover/sidebar-item:opacity-100 group-focus-visible/sidebar-item:translate-x-0 group-focus-visible/sidebar-item:opacity-100">
                        {item.label}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
