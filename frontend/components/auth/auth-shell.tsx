import { ArrowUpRight, Bell, CalendarDays, CheckCircle2, LineChart, Search, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

type AuthShellProps = Readonly<{
  children: ReactNode;
  eyebrow: string;
  title: ReactNode;
  description: string;
}>;

const statCards = [
  { label: "Leads hoje", value: "+43", tone: "text-brand-400", line: "from-brand-500/80" },
  { label: "Negocios", value: "128", tone: "text-sky-400", line: "from-sky-500/80" },
  { label: "Receita", value: "R$ 17.900", tone: "text-emerald-400", line: "from-emerald-500/80" }
];

const navItems = [
  { label: "Dashboard", icon: LineChart, active: true },
  { label: "Leads", icon: Users },
  { label: "Calendario", icon: CalendarDays },
  { label: "Ajustes", icon: Settings }
];

export function AuthShell({ children, eyebrow, title, description }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050507] text-white lg:h-screen lg:overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(106,13,173,.34),transparent_34rem),radial-gradient(circle_at_85%_85%,rgba(234,89,220,.18),transparent_28rem),linear-gradient(90deg,#050507_0%,#090909_42%,#10051d_100%)]" />
      <div className="absolute left-[42%] top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-brand-400/20 to-transparent lg:block" />

      <section className="relative z-10 grid min-h-screen lg:h-screen lg:grid-cols-[minmax(390px,0.78fr)_1.22fr]">
        <div className="flex min-h-screen items-center px-6 py-8 sm:px-10 lg:h-screen lg:min-h-0 lg:px-14 lg:py-6 xl:px-20">
          <div className="w-full max-w-[540px]">
            <BrandLogo variant="full" size="hero" priority className="mb-8 h-20 w-64 object-contain lg:mb-10" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-400">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[3rem] lg:leading-tight">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-base leading-7 text-zinc-300 xl:text-lg xl:leading-8">{description}</p>
            {children}
          </div>
        </div>

        <div className="relative hidden h-screen items-center justify-center px-6 py-6 lg:flex xl:px-8">
          <DashboardPreview />
        </div>
      </section>
    </main>
  );
}

function DashboardPreview() {
  return (
    <div className="relative h-[min(720px,calc(100vh-3rem))] w-full max-w-[920px]">
      <div className="absolute inset-0 rounded-full border border-brand-400/15" />
      <div className="absolute inset-12 rounded-full border border-brand-400/10" />

      <div className="absolute left-[10%] right-[4%] top-4 grid grid-cols-3 gap-4 xl:top-6 xl:gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-[#090d18]/72 p-4 shadow-[0_24px_80px_rgba(0,0,0,.35)] backdrop-blur-xl xl:p-5">
            <p className="text-sm text-zinc-200">{card.label}</p>
            <p className={`mt-2 text-2xl font-black xl:text-3xl ${card.tone}`}>{card.value}</p>
            <div className="mt-4 h-8 rounded-full bg-white/[0.025] p-1">
              <div className={`h-full rounded-full bg-gradient-to-r ${card.line} to-transparent opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-2 right-0 rounded-[2rem] border border-brand-400/20 bg-[#080b15]/88 p-4 shadow-[0_0_0_1px_rgba(234,89,220,.08),0_36px_120px_rgba(0,0,0,.56)] backdrop-blur-2xl xl:bottom-4 xl:p-5">
        <div className="grid h-[min(510px,calc(100vh-13rem))] min-h-[430px] grid-cols-[160px_minmax(0,1fr)]">
          <aside className="border-r border-white/10 pr-4">
            <BrandLogo variant="full" size="sm" className="mb-6 h-10 w-36" />
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold",
                      item.active ? "bg-brand-600 text-white shadow-[0_0_30px_rgba(234,89,220,.18)]" : "text-zinc-400"
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </div>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0 pl-6">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex min-h-11 w-72 items-center gap-3 rounded-full bg-white/[0.045] px-4 text-sm text-zinc-500">
                <Search className="h-4 w-4" aria-hidden />
                Buscar...
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-zinc-400" aria-hidden />
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-black">VX</span>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-black">Dashboard</h2>
                <p className="mt-1 text-sm text-zinc-500">Visao geral do seu negocio</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-zinc-400">
                Ultimos 7 dias
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_.9fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Evolucao das vendas</p>
                  <p className="text-sm font-bold text-emerald-400">+12,5%</p>
                </div>
                <div className="relative mt-5 h-36 overflow-hidden rounded-xl border border-white/5 bg-[#0b0d18] xl:h-40">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(234,89,220,.34),rgba(106,13,173,.02)),radial-gradient(circle_at_70%_10%,rgba(234,89,220,.44),transparent_8rem)]" />
                  <div className="absolute inset-x-5 bottom-5 h-16 rounded-[60%_60%_0_0] border-t-2 border-brand-400/80" />
                  <div className="absolute bottom-5 left-7 h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_20px_rgba(234,89,220,.9)]" />
                  <div className="absolute bottom-16 right-8 h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_20px_rgba(234,89,220,.9)]" />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <p className="font-bold">Funil de vendas</p>
                {["Novos leads", "Qualificados", "Proposta", "Fechados"].map((label, index) => (
                  <div key={label} className="mt-4">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{label}</span>
                      <span>{320 - index * 74}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400" style={{ width: `${78 - index * 13}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-5">
              {["Leads por origem", "Atividades", "Performance"].map((label) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-sm font-bold">{label}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" aria-hidden />
                    Sincronizado
                    <ArrowUpRight className="ml-auto h-4 w-4 text-emerald-400" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
