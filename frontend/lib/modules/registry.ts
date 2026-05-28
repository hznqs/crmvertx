export type ModuleColumn = {
  key: string;
  label: string;
  format?: "currency" | "date" | "datetime" | "status" | "boolean";
};

export type ModuleDefinition = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  endpoint: string;
  searchPlaceholder: string;
  columns: ModuleColumn[];
};

export const moduleDefinitions: ModuleDefinition[] = [
  {
    slug: "dashboard",
    title: "Dashboard",
    eyebrow: "Visao executiva",
    description: "Indicadores principais de receita, clientes, contratos, tarefas e riscos operacionais.",
    endpoint: "/api/dashboard/metrics",
    searchPlaceholder: "Dashboard consolidado",
    columns: [
      { key: "monthlyRevenue", label: "Receita mensal", format: "currency" },
      { key: "netProfit", label: "Lucro liquido", format: "currency" },
      { key: "mrr", label: "MRR", format: "currency" },
      { key: "activeContracts", label: "Contratos ativos" },
      { key: "operationalRiskRate", label: "Risco operacional" }
    ]
  },
  {
    slug: "operational-dashboard",
    title: "Dashboard Operacional",
    eyebrow: "Operacao",
    description: "Projetos em risco, tarefas atrasadas, entregas e capacidade da equipe.",
    endpoint: "/api/dashboard/metrics",
    searchPlaceholder: "Visao operacional",
    columns: [
      { key: "projectsAtRisk", label: "Projetos em risco" },
      { key: "lateTasks", label: "Tarefas atrasadas" },
      { key: "lateDeliveries", label: "Entregas atrasadas" },
      { key: "operationalRiskRate", label: "Risco operacional" }
    ]
  },
  {
    slug: "executive-dashboard",
    title: "Dashboard Executivo",
    eyebrow: "Estrategia",
    description: "Lucro estimado, margem, churn, MRR, ticket medio e clientes de maior valor.",
    endpoint: "/api/dashboard/metrics",
    searchPlaceholder: "Visao executiva",
    columns: [
      { key: "mrr", label: "MRR", format: "currency" },
      { key: "netProfit", label: "Lucro liquido", format: "currency" },
      { key: "averageTicket", label: "Ticket medio", format: "currency" },
      { key: "profitMargin", label: "Margem" },
      { key: "contractsExpiring", label: "Vencimentos" }
    ]
  },
  {
    slug: "clients",
    title: "Clientes",
    eyebrow: "Relacionamento",
    description: "Base de clientes, status, prioridade, contrato, tags e perfil operacional.",
    endpoint: "/api/clients",
    searchPlaceholder: "Buscar por empresa, contato, email ou documento",
    columns: [
      { key: "name", label: "Empresa" },
      { key: "contactName", label: "Responsavel" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status", format: "status" },
      { key: "contractValue", label: "Contrato", format: "currency" }
    ]
  },
  {
    slug: "services",
    title: "Servicos",
    eyebrow: "Catalogo",
    description: "Ofertas, categorias, SLA, checklist padrao, margem e comissao.",
    endpoint: "/api/services",
    searchPlaceholder: "Buscar por nome, descricao, checklist ou etapas",
    columns: [
      { key: "name", label: "Servico" },
      { key: "category", label: "Categoria", format: "status" },
      { key: "billingType", label: "Cobranca", format: "status" },
      { key: "basePrice", label: "Preco", format: "currency" },
      { key: "active", label: "Ativo", format: "boolean" }
    ]
  },
  {
    slug: "projects",
    title: "Projetos",
    eyebrow: "Operacao",
    description: "Projetos por cliente, contrato, SLA, equipe, progresso e orcamento.",
    endpoint: "/api/projects",
    searchPlaceholder: "Buscar por projeto ou descricao",
    columns: [
      { key: "name", label: "Projeto" },
      { key: "status", label: "Status", format: "status" },
      { key: "ownerName", label: "Responsavel" },
      { key: "progress", label: "Progresso" },
      { key: "budget", label: "Orcamento", format: "currency" }
    ]
  },
  {
    slug: "tasks",
    title: "Tarefas",
    eyebrow: "Execucao",
    description: "Demandas por projeto, entrega, responsavel, prioridade e prazo.",
    endpoint: "/api/tasks",
    searchPlaceholder: "Buscar por titulo ou descricao",
    columns: [
      { key: "title", label: "Tarefa" },
      { key: "status", label: "Status", format: "status" },
      { key: "priority", label: "Prioridade", format: "status" },
      { key: "assigneeName", label: "Responsavel" },
      { key: "dueDate", label: "Prazo", format: "date" }
    ]
  },
  {
    slug: "pipeline",
    title: "Pipeline",
    eyebrow: "Kanban comercial",
    description: "Oportunidades por fase comercial com arraste entre etapas e previsao de valor.",
    endpoint: "/api/leads",
    searchPlaceholder: "Buscar oportunidades no funil",
    columns: [
      { key: "name", label: "Lead" },
      { key: "commercialStage", label: "Fase", format: "status" },
      { key: "temperature", label: "Temperatura", format: "status" },
      { key: "potentialValue", label: "Potencial", format: "currency" },
      { key: "updatedAt", label: "Atualizado", format: "datetime" }
    ]
  },
  {
    slug: "contracts",
    title: "Contratos",
    eyebrow: "Receita recorrente",
    description: "Contratos ativos, vigencia, renovacao, vencimento e valores.",
    endpoint: "/api/contracts",
    searchPlaceholder: "Buscar por cliente, servico ou status",
    columns: [
      { key: "clientName", label: "Cliente" },
      { key: "status", label: "Status", format: "status" },
      { key: "monthlyValue", label: "Mensalidade", format: "currency" },
      { key: "totalValue", label: "Total", format: "currency" },
      { key: "endDate", label: "Termino", format: "date" }
    ]
  },
  {
    slug: "deliveries",
    title: "Entregas",
    eyebrow: "Pipeline operacional",
    description: "Entregas por projeto, cliente, contrato, servico, prazo e status.",
    endpoint: "/api/deliveries",
    searchPlaceholder: "Buscar entregas",
    columns: [
      { key: "title", label: "Entrega" },
      { key: "clientName", label: "Cliente" },
      { key: "status", label: "Status", format: "status" },
      { key: "owner", label: "Responsavel" },
      { key: "deadline", label: "Prazo", format: "date" }
    ]
  },
  {
    slug: "team",
    title: "Equipe",
    eyebrow: "Capacidade",
    description: "Membros, cargos, performance, carga de trabalho e produtividade.",
    endpoint: "/api/team-members",
    searchPlaceholder: "Buscar membro",
    columns: [
      { key: "name", label: "Membro" },
      { key: "role", label: "Cargo", format: "status" },
      { key: "tasks", label: "Tarefas" },
      { key: "completed", label: "Concluidas" },
      { key: "performance", label: "Performance" }
    ]
  },
  {
    slug: "commissions",
    title: "Comissoes",
    eyebrow: "Vendas",
    description: "Comissoes por venda, renovacao, recorrencia, bonus e pagamento.",
    endpoint: "/api/commission-sales",
    searchPlaceholder: "Buscar comissao",
    columns: [
      { key: "memberName", label: "Membro" },
      { key: "client", label: "Cliente" },
      { key: "type", label: "Tipo", format: "status" },
      { key: "status", label: "Status", format: "status" },
      { key: "commission", label: "Comissao", format: "currency" }
    ]
  },
  {
    slug: "finance",
    title: "Financeiro",
    eyebrow: "Controle financeiro",
    description: "Receitas, despesas, centros de custo, recorrencia e vencimentos.",
    endpoint: "/api/finance-entries",
    searchPlaceholder: "Buscar lancamento financeiro",
    columns: [
      { key: "description", label: "Lancamento" },
      { key: "type", label: "Tipo", format: "status" },
      { key: "status", label: "Status", format: "status" },
      { key: "costCenter", label: "Centro de custo" },
      { key: "value", label: "Valor", format: "currency" }
    ]
  },
  {
    slug: "goals",
    title: "Metas",
    eyebrow: "Performance",
    description: "Metas por faturamento, vendas, clientes, reunioes, entregas e lucro.",
    endpoint: "/api/goals",
    searchPlaceholder: "Buscar meta",
    columns: [
      { key: "name", label: "Meta" },
      { key: "type", label: "Tipo", format: "status" },
      { key: "target", label: "Alvo", format: "currency" },
      { key: "actual", label: "Atual", format: "currency" },
      { key: "date", label: "Data", format: "date" }
    ]
  },
  {
    slug: "performance",
    title: "Performance Cliente",
    eyebrow: "Marketing",
    description: "ROI, CPL, conversao, leads gerados e investimento por cliente.",
    endpoint: "/api/performance-records",
    searchPlaceholder: "Buscar performance",
    columns: [
      { key: "clientName", label: "Cliente" },
      { key: "metricDate", label: "Data", format: "date" },
      { key: "leads", label: "Leads" },
      { key: "cpl", label: "CPL", format: "currency" },
      { key: "roi", label: "ROI" }
    ]
  },
  {
    slug: "billing",
    title: "Faturamento",
    eyebrow: "Receita",
    description: "Resumo de faturamento, ticket medio e contratos ativos.",
    endpoint: "/api/billing/summary",
    searchPlaceholder: "Resumo de faturamento",
    columns: [
      { key: "totalRevenue", label: "Receita total", format: "currency" },
      { key: "averageTicket", label: "Ticket medio", format: "currency" },
      { key: "activeContracts", label: "Contratos ativos" }
    ]
  }
];

export function findModuleDefinition(slug: string) {
  return moduleDefinitions.find((moduleDefinition) => moduleDefinition.slug === slug);
}
