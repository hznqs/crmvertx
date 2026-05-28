import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  Flag,
  Gauge,
  Goal,
  Handshake,
  KanbanSquare,
  Landmark,
  LayoutDashboard,
  LineChart,
  Plug,
  Settings,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import type { CrmModule } from "@/lib/auth/permissions";

export type NavigationItem = {
  href: string;
  label: string;
  module: CrmModule;
  icon: LucideIcon;
  section: "growth" | "operations" | "finance" | "platform";
};

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard", module: "DASHBOARD", icon: LayoutDashboard, section: "growth" },
  { href: "/analytics", label: "Analytics", module: "DASHBOARD", icon: BarChart3, section: "growth" },
  { href: "/activity", label: "Activity Feed", module: "AUDIT", icon: Activity, section: "growth" },
  { href: "/operational-dashboard", label: "Dash Operacional", module: "DASHBOARD", icon: Gauge, section: "growth" },
  { href: "/executive-dashboard", label: "Dash Executivo", module: "DASHBOARD", icon: LineChart, section: "growth" },
  { href: "/leads", label: "Leads", module: "LEADS", icon: Sparkles, section: "growth" },
  { href: "/pipeline", label: "Pipeline", module: "LEADS", icon: KanbanSquare, section: "growth" },
  { href: "/clients", label: "Clientes", module: "CLIENTS", icon: Handshake, section: "operations" },
  { href: "/services", label: "Servicos", module: "SERVICES", icon: BriefcaseBusiness, section: "operations" },
  { href: "/projects", label: "Projetos", module: "PROJECTS", icon: Flag, section: "operations" },
  { href: "/tasks", label: "Tarefas", module: "TASKS", icon: ClipboardList, section: "operations" },
  { href: "/calendar", label: "Agenda", module: "AGENDA", icon: CalendarDays, section: "operations" },
  { href: "/deliveries", label: "Entregas", module: "DELIVERIES", icon: Activity, section: "operations" },
  { href: "/deliveries/kanban", label: "Kanban Entregas", module: "DELIVERIES", icon: KanbanSquare, section: "operations" },
  { href: "/team", label: "Equipe", module: "TEAM", icon: Users, section: "operations" },
  { href: "/users", label: "Usuarios", module: "TEAM", icon: ShieldCheck, section: "operations" },
  { href: "/contracts", label: "Contratos", module: "CONTRACTS", icon: FileText, section: "finance" },
  { href: "/finance", label: "Financeiro", module: "FINANCE", icon: Landmark, section: "finance" },
  { href: "/billing", label: "Faturamento", module: "BILLING", icon: CreditCard, section: "finance" },
  { href: "/commissions", label: "Comissoes", module: "COMMISSIONS", icon: Goal, section: "finance" },
  { href: "/goals", label: "Metas", module: "GOALS", icon: Goal, section: "finance" },
  { href: "/performance", label: "Performance", module: "PERFORMANCE", icon: LineChart, section: "finance" },
  { href: "/documents", label: "Documentos", module: "UPLOADS", icon: FileText, section: "platform" },
  { href: "/notifications", label: "Notificacoes", module: "SETTINGS", icon: Bell, section: "platform" },
  { href: "/integrations", label: "Integracoes", module: "SETTINGS", icon: Plug, section: "platform" },
  { href: "/settings", label: "Configuracoes", module: "SETTINGS", icon: Settings, section: "platform" }
] satisfies NavigationItem[];

export const navigationSections = [
  { id: "growth", label: "Crescimento" },
  { id: "operations", label: "Operacao" },
  { id: "finance", label: "Financeiro" },
  { id: "platform", label: "Plataforma" }
] as const;
