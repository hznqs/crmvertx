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
};

export function AppNavigation({ role }: AppNavigationProps) {
  const pathname = usePathname();
  const visibleItems = navigationItems.filter((item) => canReadModule(role, item.module));

  return (
    <nav className="calendar-scrollbar mt-6 max-h-[calc(100vh-128px)] space-y-5 overflow-y-auto pr-1">
      {navigationSections.map((section) => {
        const sectionItems = visibleItems.filter((item) => item.section === section.id);
        if (!sectionItems.length) {
          return null;
        }

        return (
          <div key={section.id}>
            <p className="px-3 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-600">
              {section.label}
            </p>
            <div className="mt-2 space-y-1">
              {sectionItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-crm px-3 text-sm font-semibold transition duration-premium ease-premium focus-visible:shadow-focus",
                      isActive
                        ? "border border-brand-400/15 bg-brand-500/15 text-white shadow-[inset_3px_0_0_rgba(234,89,220,.9),0_0_28px_rgba(106,13,173,.14)]"
                        : "border border-transparent text-zinc-400 hover:border-brand-400/10 hover:bg-brand-500/10 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-brand-400" : "text-zinc-600")} aria-hidden />
                    <span>{item.label}</span>
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
