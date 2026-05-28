export type UserRole =
  | "ADMIN"
  | "GESTOR"
  | "COMERCIAL"
  | "OPERACIONAL"
  | "FINANCEIRO"
  | "SUPORTE"
  | "MANAGER"
  | "USER";

export type CrmModule =
  | "AUDIT"
  | "BILLING"
  | "UPLOADS"
  | "LEADS"
  | "CLIENTS"
  | "SERVICES"
  | "PROJECTS"
  | "TASKS"
  | "CONTRACTS"
  | "FINANCE"
  | "DELIVERIES"
  | "TEAM"
  | "COMMISSIONS"
  | "AGENDA"
  | "GOALS"
  | "DASHBOARD"
  | "PERFORMANCE"
  | "ORGANIZATION"
  | "SETTINGS";

type PermissionLevel = "read" | "write" | "manage";
type PermissionMatrix = Record<CrmModule, Record<PermissionLevel, UserRole[]>>;

export type ModuleActionPermissions = {
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
};

export const permissionMatrix: PermissionMatrix = {
  AUDIT: {
    read: ["ADMIN", "GESTOR", "MANAGER"],
    write: [],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  BILLING: {
    read: ["ADMIN", "GESTOR", "MANAGER", "FINANCEIRO"],
    write: ["ADMIN", "GESTOR", "MANAGER", "FINANCEIRO"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  UPLOADS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SUPORTE"],
    write: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SUPORTE"],
    manage: ["ADMIN", "GESTOR", "MANAGER", "OPERACIONAL"]
  },
  LEADS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL"],
    write: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  CLIENTS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SUPORTE"],
    write: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  SERVICES: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "OPERACIONAL", "FINANCEIRO"],
    write: ["ADMIN", "GESTOR", "MANAGER"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  PROJECTS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SUPORTE"],
    write: ["ADMIN", "GESTOR", "MANAGER", "OPERACIONAL"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  TASKS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "OPERACIONAL", "COMERCIAL", "SUPORTE"],
    write: ["ADMIN", "GESTOR", "MANAGER", "OPERACIONAL"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  CONTRACTS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "FINANCEIRO"],
    write: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "FINANCEIRO"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  FINANCE: {
    read: ["ADMIN", "GESTOR", "MANAGER", "FINANCEIRO"],
    write: ["ADMIN", "GESTOR", "MANAGER", "FINANCEIRO"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  DELIVERIES: {
    read: ["ADMIN", "GESTOR", "MANAGER", "OPERACIONAL", "COMERCIAL", "SUPORTE"],
    write: ["ADMIN", "GESTOR", "MANAGER", "OPERACIONAL"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  TEAM: {
    read: ["ADMIN", "GESTOR", "MANAGER", "OPERACIONAL"],
    write: ["ADMIN", "GESTOR", "MANAGER"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  COMMISSIONS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "FINANCEIRO"],
    write: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "FINANCEIRO"],
    manage: ["ADMIN", "GESTOR", "MANAGER", "FINANCEIRO"]
  },
  AGENDA: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "OPERACIONAL", "SUPORTE"],
    write: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "OPERACIONAL"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  GOALS: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "FINANCEIRO"],
    write: ["ADMIN", "GESTOR", "MANAGER"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  DASHBOARD: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "FINANCEIRO", "OPERACIONAL"],
    write: [],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  PERFORMANCE: {
    read: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL", "FINANCEIRO"],
    write: ["ADMIN", "GESTOR", "MANAGER", "COMERCIAL"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  ORGANIZATION: {
    read: ["ADMIN", "GESTOR", "MANAGER"],
    write: ["ADMIN", "GESTOR", "MANAGER"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  },
  SETTINGS: {
    read: ["ADMIN", "GESTOR", "MANAGER"],
    write: ["ADMIN", "GESTOR", "MANAGER"],
    manage: ["ADMIN", "GESTOR", "MANAGER"]
  }
};

export function canReadModule(role: UserRole | null, module: CrmModule) {
  return canAccessModule(role, module, "read");
}

export function canWriteModule(role: UserRole | null, module: CrmModule) {
  return canAccessModule(role, module, "write");
}

export function canManageModule(role: UserRole | null, module: CrmModule) {
  return canAccessModule(role, module, "manage");
}

export function moduleActionPermissions(
  role: UserRole | null,
  module: CrmModule
): ModuleActionPermissions {
  return {
    canRead: canReadModule(role, module),
    canWrite: canWriteModule(role, module),
    canManage: canManageModule(role, module)
  };
}

function canAccessModule(
  role: UserRole | null,
  module: CrmModule,
  level: PermissionLevel
) {
  return role ? permissionMatrix[module][level].includes(role) : false;
}

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== "string") {
    return null;
  }

  const normalizedRole = role.replace(/^ROLE_/, "").toUpperCase();
  return isUserRole(normalizedRole) ? normalizedRole : null;
}

function isUserRole(role: string): role is UserRole {
  return [
    "ADMIN",
    "GESTOR",
    "COMERCIAL",
    "OPERACIONAL",
    "FINANCEIRO",
    "SUPORTE",
    "MANAGER",
    "USER"
  ].includes(role);
}
