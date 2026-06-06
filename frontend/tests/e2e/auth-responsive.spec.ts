import { expect, test } from "@playwright/test";

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

for (const viewport of viewports) {
  test(`login stays usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/login");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Entrar na plataforma/ })).toBeVisible();
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test(`register stays usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: /Cadastro por aprovação/ })).toBeVisible();
    await expect(page.getByText(/novos acessos são criados por um administrador/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Voltar para login/ })).toBeVisible();
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
}

async function hasNoHorizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}
