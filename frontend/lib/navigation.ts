import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  Flag,
  Goal,
  Handshake,
  KanbanSquare,
  Landmark,
  LayoutDashboard,
  Settings,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import type { CrmModule } from "@/lib/auth/permissions";

export type NavigationItem = {
  href: string;
  label: string;
  module: CrmModule;
  icon: LucideIcon;
  section: "overview" | "commercial" | "operations" | "financial" | "team";
};

export const navigationItems = [
  // ─── VISÃO GERAL ───────────────────────────────────────────────
  { href: "/dashboard",  label: "Dashboard", module: "DASHBOARD",    icon: LayoutDashboard, section: "overview" },
  { href: "/analytics",  label: "Gráficos",  module: "DASHBOARD",    icon: BarChart3,        section: "overview" },

  // ─── COMERCIAL ─────────────────────────────────────────────────
  { href: "/leads",      label: "Leads",     module: "LEADS",        icon: Sparkles,         section: "commercial" },
  { href: "/pipeline",   label: "Pipeline",  module: "LEADS",        icon: KanbanSquare,     section: "commercial" },
  { href: "/clients",    label: "Clientes",  module: "CLIENTS",      icon: Handshake,        section: "commercial" },
  { href: "/contracts",  label: "Contratos", module: "CONTRACTS",    icon: FileText,         section: "commercial" },

  // ─── OPERAÇÃO ──────────────────────────────────────────────────
  { href: "/services",   label: "Serviços",  module: "SERVICES",     icon: BriefcaseBusiness,section: "operations" },
  { href: "/projects",   label: "Projetos",  module: "PROJECTS",     icon: Flag,             section: "operations" },
  { href: "/deliveries", label: "Entregas",  module: "DELIVERIES",   icon: TrendingUp,       section: "operations" },
  { href: "/tasks",      label: "Tarefas",   module: "TASKS",        icon: ClipboardList,    section: "operations" },
  { href: "/calendar",   label: "Agenda",    module: "AGENDA",       icon: CalendarDays,     section: "operations" },

  // ─── FINANCEIRO ────────────────────────────────────────────────
  { href: "/billing",     label: "Faturamento", module: "BILLING",     icon: CreditCard,  section: "financial" },
  { href: "/finance",     label: "Financeiro",  module: "FINANCE",     icon: Landmark,    section: "financial" },
  { href: "/commissions", label: "Comissões",   module: "COMMISSIONS", icon: Goal,        section: "financial" },
  { href: "/goals",       label: "Metas",       module: "GOALS",       icon: Goal,        section: "financial" },

  // ─── EQUIPE ────────────────────────────────────────────────────
  { href: "/team",      label: "Equipe",         module: "TEAM",     icon: Users,    section: "team" },
  { href: "/settings",  label: "Configurações",  module: "SETTINGS", icon: Settings, section: "team" }
] satisfies NavigationItem[];

export const navigationSections = [
  { id: "overview",    label: "Visão Geral" },
  { id: "commercial",  label: "Comercial"   },
  { id: "operations",  label: "Operação"    },
  { id: "financial",   label: "Financeiro"  },
  { id: "team",        label: "Equipe"      }
] as const;
