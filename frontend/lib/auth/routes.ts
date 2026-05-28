import {
  canReadModule,
  normalizeUserRole,
  type CrmModule,
  type UserRole
} from "@/lib/auth/permissions";

type ProtectedRoute = {
  path: string;
  module: CrmModule;
};

export const protectedRoutes = [
  { path: "/dashboard", module: "DASHBOARD" },
  { path: "/activity", module: "AUDIT" },
  { path: "/operational-dashboard", module: "DASHBOARD" },
  { path: "/executive-dashboard", module: "DASHBOARD" },
  { path: "/leads", module: "LEADS" },
  { path: "/pipeline", module: "LEADS" },
  { path: "/clients", module: "CLIENTS" },
  { path: "/services", module: "SERVICES" },
  { path: "/projects", module: "PROJECTS" },
  { path: "/tasks", module: "TASKS" },
  { path: "/calendar", module: "AGENDA" },
  { path: "/contracts", module: "CONTRACTS" },
  { path: "/deliveries", module: "DELIVERIES" },
  { path: "/team", module: "TEAM" },
  { path: "/commissions", module: "COMMISSIONS" },
  { path: "/finance", module: "FINANCE" },
  { path: "/goals", module: "GOALS" },
  { path: "/performance", module: "PERFORMANCE" },
  { path: "/billing", module: "BILLING" },
  { path: "/documents", module: "UPLOADS" },
  { path: "/analytics", module: "DASHBOARD" },
  { path: "/users", module: "TEAM" },
  { path: "/notifications", module: "SETTINGS" },
  { path: "/integrations", module: "SETTINGS" },
  { path: "/settings", module: "SETTINGS" }
] satisfies ProtectedRoute[];

export function firstReadablePath(role: UserRole | null) {
  return protectedRoutes.find((route) => canReadModule(role, route.module))?.path ?? "/forbidden";
}

export function readableRedirectPath(role: UserRole | null, requestedPath: string | undefined) {
  const safeRequestedPath = safeInternalPath(requestedPath);
  return canReadPath(role, safeRequestedPath)
    ? safeRequestedPath
    : firstReadablePath(role);
}

export function canReadPath(role: UserRole | null, pathname: string) {
  const routeModule = moduleFromPathname(pathname);
  return routeModule ? canReadModule(role, routeModule) : true;
}

export function moduleFromPathname(pathname: string): CrmModule | null {
  const normalizedPathname = pathname === "/" ? "/dashboard" : pathname;
  const matchedRoute = protectedRoutes.find((route) =>
    normalizedPathname === route.path || normalizedPathname.startsWith(`${route.path}/`)
  );

  return matchedRoute?.module ?? null;
}

export function normalizedRoleFromValue(role: unknown) {
  return normalizeUserRole(role);
}

export function safeInternalPath(path: string | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }

  if (path.startsWith("/login") || path.startsWith("/api/")) {
    return "/dashboard";
  }

  return path;
}
