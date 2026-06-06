import { expect, test, type Page } from "@playwright/test";

test.setTimeout(120_000);

const viewports = [
  { width: 320, height: 740 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
];

const internalRoutes = [
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
];

const unavailableRoutes = [
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

for (const viewport of viewports) {
  test(`authenticated CRM pages stay inside viewport at ${viewport.width}px`, async ({ context, page }) => {
    await context.addCookies(authCookies());
    await page.setViewportSize(viewport);

    for (const route of internalRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page).not.toHaveURL(/\/forbidden/);
      await expect(page.locator("main").first()).toBeVisible();
      expect(await hasNoDocumentHorizontalOverflow(page), `${route} overflow at ${viewport.width}px`).toBe(true);
      expect(await hasNoVisibleFixedOverlayEscapingViewport(page), `${route} fixed overlay escapes at ${viewport.width}px`).toBe(true);
    }
  });
}

test("hidden or incomplete modules return a controlled not-found page", async ({ context, page }) => {
  await context.addCookies(authCookies());

  for (const route of unavailableRoutes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded", timeout: 20_000 });
    expect(response?.status(), `${route} should not be exposed as a functional page`).toBe(404);
    await expect(page.getByRole("heading", { name: /Essa area nao existe ou foi movida/i })).toBeVisible();
  }
});

function authCookies() {
  const token = testJwt({
    sub: "visual-audit-admin",
    name: "Visual Audit",
    email: "audit@vertxmidia.local",
    role: "ADMIN",
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  });

  return [
    {
      name: "crm_access_token",
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Strict" as const
    },
    {
      name: "crm_refresh_token",
      value: "visual-audit-refresh-token",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Strict" as const
    }
  ];
}

function testJwt(payload: Record<string, unknown>) {
  return [
    base64Url(JSON.stringify({ alg: "none", typ: "JWT" })),
    base64Url(JSON.stringify(payload)),
    "visual-audit"
  ].join(".");
}

function base64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function hasNoDocumentHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

async function hasNoVisibleFixedOverlayEscapingViewport(page: Page) {
  return page.evaluate(() => {
    const tolerance = 2;
    return Array.from(document.body.querySelectorAll<HTMLElement>("body *"))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.position === "fixed"
          && style.visibility !== "hidden"
          && style.display !== "none"
          && Number(style.opacity) !== 0
          && rect.width > 0
          && rect.height > 0;
      })
      .every((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left >= -tolerance && rect.right <= window.innerWidth + tolerance;
      });
  });
}
