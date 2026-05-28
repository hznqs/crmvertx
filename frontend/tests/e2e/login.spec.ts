import { expect, test } from "@playwright/test";

test("login page renders the enterprise shell entrypoint", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});
