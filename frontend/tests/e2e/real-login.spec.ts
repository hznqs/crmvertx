import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const credentials = readRootEnvCredentials();

test("real admin credentials can login through the UI", async ({ page }) => {
  if (!credentials) {
    test.skip(true, "ADMIN_EMAIL and ADMIN_PASSWORD are required in the root .env file.");
    return;
  }

  if (!(await isBackendReachable(credentials.apiBaseUrl))) {
    test.skip(true, `Backend is not reachable at ${credentials.apiBaseUrl}.`);
    return;
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole("button", { name: /Entrar na plataforma/ }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Dashboard Principal/ })).toBeVisible();
});

function readRootEnvCredentials() {
  const envPath = path.resolve(process.cwd(), "..", ".env");
  if (!fs.existsSync(envPath)) {
    return null;
  }

  const values = new Map<string, string>();
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*=/.test(line)) continue;
    const separatorIndex = line.indexOf("=");
    const key = line.slice(0, separatorIndex);
    const rawValue = line.slice(separatorIndex + 1).trim();
    values.set(key, rawValue.replace(/^["']|["']$/g, ""));
  }

  const email = values.get("ADMIN_EMAIL");
  const password = values.get("ADMIN_PASSWORD");
  const apiBaseUrl = values.get("CRM_API_BASE_URL") ?? "http://localhost:8080";
  return email && password ? { email, password, apiBaseUrl } : null;
}

async function isBackendReachable(apiBaseUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${apiBaseUrl}/actuator/health`, {
      signal: controller.signal
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
