"use client";

import { Command } from "cmdk";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { canReadModule, type UserRole } from "@/lib/auth/permissions";
import { navigationItems, navigationSections } from "@/lib/navigation";
import { useUiStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

export function CommandPalette({ role }: Readonly<{ role: UserRole | null }>) {
  const router = useRouter();
  const pathname = usePathname();
  const open = useUiStore((state) => state.commandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const readableItems = navigationItems.filter((item) => canReadModule(role, item.module));

  function navigate(href: string) {
    setOpen(false);
    if (href !== pathname) {
      router.push(href);
    }
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Comando global"
      className="fixed inset-0 z-[80] grid place-items-start bg-[#090909]/72 px-2 pt-[10vh] backdrop-blur-xl sm:px-4 sm:pt-[12vh]"
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="crm-popover-surface mx-auto w-full max-w-[calc(100vw-1rem)] overflow-hidden sm:max-w-2xl"
      >
        <div className="flex min-w-0 items-center gap-3 border-b border-line bg-white/[0.025] px-3 sm:px-4">
          <BrandLogo variant="mark" size="sm" className="h-8 w-8" />
          <Search className="h-4 w-4 text-zinc-500" aria-hidden />
          <Command.Input
            placeholder="Buscar modulos, acoes e paginas..."
            className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
          <kbd className="rounded border border-brand-400/15 bg-brand-500/10 px-2 py-1 text-[10px] font-bold text-fuchsia-100">
            ESC
          </kbd>
        </div>
        <Command.List className="calendar-scrollbar max-h-[420px] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
            <span className="mx-auto mb-3 flex justify-center">
              <BrandLogo variant="mark" size="md" />
            </span>
            Nada encontrado.
          </Command.Empty>
          {navigationSections.map((section) => {
            const sectionItems = readableItems.filter((item) => item.section === section.id);

            return (
              <Command.Group
                key={section.id}
                heading={section.label}
                className="px-1 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-600 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
              >
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={`${item.label} ${item.href}`}
                      onSelect={() => navigate(item.href)}
                      className={cn(
                        "flex min-w-0 cursor-pointer items-center gap-3 rounded-crm px-3 py-3 text-sm font-semibold text-zinc-300 outline-none transition duration-premium ease-premium",
                        "data-[selected=true]:bg-brand-500/15 data-[selected=true]:text-white data-[selected=true]:shadow-[0_0_24px_rgba(234,89,220,.12)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                      <span className="min-w-0 truncate">{item.label}</span>
                      <span className="ml-auto hidden max-w-[42%] truncate text-xs font-medium text-zinc-600 sm:inline">{item.href}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            );
          })}
        </Command.List>
      </motion.div>
    </Command.Dialog>
  );
}
