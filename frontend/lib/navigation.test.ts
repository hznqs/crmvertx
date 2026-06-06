import { isUnavailableFrontendPath, safeInternalPath } from "@/lib/auth/routes";
import { navigationItems, navigationSections } from "@/lib/navigation";

const hiddenRoutes = [
  "/activity",
  "/operational-dashboard",
  "/executive-dashboard",
  "/integrations",
  "/notifications",
  "/documents",
  "/performance",
  "/users",
  "/deliveries/kanban"
];

describe("CRM navigation scope", () => {
  it("keeps sidebar navigation focused on the current internal CRM modules", () => {
    expect(navigationSections.map((section) => section.label)).toEqual([
      "Visão Geral",
      "Comercial",
      "Operação",
      "Financeiro",
      "Equipe"
    ]);

    const visibleHrefs = navigationItems.map((item) => item.href);

    expect(visibleHrefs).toEqual([
      "/dashboard",
      "/analytics",
      "/leads",
      "/pipeline",
      "/clients",
      "/contracts",
      "/services",
      "/projects",
      "/deliveries",
      "/tasks",
      "/calendar",
      "/billing",
      "/finance",
      "/commissions",
      "/goals",
      "/team",
      "/settings"
    ]);
    expect(visibleHrefs).not.toEqual(expect.arrayContaining(hiddenRoutes));
  });

  it("marks hidden direct URLs as unavailable and keeps redirects inside current-scope modules", () => {
    expect(isUnavailableFrontendPath("/activity")).toBe(true);
    expect(isUnavailableFrontendPath("/executive-dashboard")).toBe(true);
    expect(isUnavailableFrontendPath("/users")).toBe(true);
    expect(isUnavailableFrontendPath("/deliveries/kanban")).toBe(true);
    expect(isUnavailableFrontendPath("/dashboard")).toBe(false);
    expect(safeInternalPath("/notifications")).toBe("/dashboard");
  });
});
