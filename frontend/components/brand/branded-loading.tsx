import { BrandLogo } from "@/components/brand/brand-logo";

export function BrandedLoading({ label = "Carregando plataforma" }: Readonly<{ label?: string }>) {
  return (
    <div className="flex items-center gap-3 rounded-crm-lg border border-brand-400/10 bg-white/[0.035] px-4 py-3 shadow-panel">
      <BrandLogo variant="mark" size="sm" />
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-400">
          VX Midia CRM
        </p>
        <p className="mt-1 text-sm text-muted">{label}</p>
      </div>
      <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-brand-400 shadow-[0_0_18px_rgba(234,89,220,.6)]" />
    </div>
  );
}
