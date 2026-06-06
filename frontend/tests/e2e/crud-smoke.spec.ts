import { expect, test, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const credentials = readRootEnvCredentials();

test.describe.configure({ mode: "serial" });
test.setTimeout(300_000);

test("real admin can create, edit and remove core operational records", async ({ page }) => {
  test.skip(!credentials, "ADMIN_EMAIL and ADMIN_PASSWORD are required in the root .env file.");
  test.skip(!(await isBackendReachable(credentials!.apiBaseUrl)), `Backend is not reachable at ${credentials!.apiBaseUrl}.`);

  const stamp = Date.now();
  const today = isoDate(0);
  const names = {
    lead: `QA Lead ${stamp}`,
    leadEdited: `QA Lead ${stamp} Editado`,
    client: `QA Cliente ${stamp}`,
    clientEdited: `QA Cliente ${stamp} Editado`,
    service: `QA Servico ${stamp}`,
    serviceEdited: `QA Servico ${stamp} Editado`,
    contract: `QA Contrato ${stamp}`,
    contractEdited: `QA Contrato ${stamp} Editado`,
    project: `QA Projeto ${stamp}`,
    projectEdited: `QA Projeto ${stamp} Editado`,
    task: `QA Tarefa ${stamp}`,
    taskEdited: `QA Tarefa ${stamp} Editada`,
    delivery: `QA Entrega ${stamp}`,
    deliveryEdited: `QA Entrega ${stamp} Editada`,
    finance: `QA Lancamento ${stamp}`,
    financeEdited: `QA Lancamento ${stamp} Editado`,
    team: `QA Membro ${stamp}`,
    teamEdited: `QA Membro ${stamp} Editado`,
    commissionClient: `QA Comissao Cliente ${stamp}`,
    commissionClientEdited: `QA Comissao Cliente ${stamp} Editado`
  };

  await login(page, credentials!);

  await createLead(page, names);
  await createClient(page, names);
  await createService(page, names);
  await createContract(page, names);
  await createProject(page, names);
  await createTask(page, names);
  await createDelivery(page, names);
  await createFinanceEntry(page, names);
  await createTeamMember(page, names);
  await createCommission(page, names);
  await createGoal(page, today, stamp);
  await createCalendarMeeting(page, stamp, today);

  await deleteByRow(page, "/commissions?size=100", names.commissionClientEdited);
  await deleteByRow(page, `/team?search=${encodeURIComponent(names.teamEdited)}`, names.teamEdited);
  await deleteByRow(page, "/finance?size=100", names.financeEdited, /^Cancelar lancamento$/);
  await deleteByRow(page, "/deliveries?size=100", names.deliveryEdited);
  await deleteByRow(page, `/tasks?search=${encodeURIComponent(names.taskEdited)}`, names.taskEdited);
  await deleteByRow(page, `/projects?search=${encodeURIComponent(names.projectEdited)}`, names.projectEdited);
  await deleteByRow(page, "/contracts?size=100", names.contractEdited, /^Arquivar contrato$/);
  await deleteByRow(page, `/clients?search=${encodeURIComponent(names.clientEdited)}`, names.clientEdited);
  await deleteByRow(page, `/services?search=${encodeURIComponent(names.serviceEdited)}`, names.serviceEdited);
  await deleteByRow(page, `/leads?search=${encodeURIComponent(names.leadEdited)}`, names.leadEdited);
});

async function createLead(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, `/leads?search=${encodeURIComponent(names.lead)}`, "Novo lead", "Cadastrar lead");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Nome", names.lead);
  await fillField(dialog, "Empresa", `Empresa ${names.lead}`);
  await fillField(dialog, "Email", `qa.lead.${Date.now()}@vertxmidia.test`);
  await fillField(dialog, "Telefone", "11999999999");
  await fillField(dialog, "Valor potencial", "1200");
  await fillField(dialog, "Segmento", "QA");
  await submitDialog(page, "Salvar lead");
  await expectText(page, names.lead);

  await openEditFromRow(page, names.lead);
  await fillField(page.getByRole("dialog"), "Nome", names.leadEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.leadEdited);
}

async function createClient(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, `/clients?search=${encodeURIComponent(names.client)}`, "Novo cliente", "Cadastrar cliente");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Empresa", names.client);
  await fillField(dialog, "Responsavel", "QA Responsavel");
  await fillField(dialog, "Email", `qa.client.${Date.now()}@vertxmidia.test`);
  await fillField(dialog, "Telefone", "11988887777");
  await fillField(dialog, "Segmento", "QA");
  await submitDialog(page, "Salvar cliente");
  await expectText(page, names.client);

  await openEditFromRow(page, names.client);
  await fillField(page.getByRole("dialog"), "Empresa", names.clientEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.clientEdited);
}

async function createService(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, `/services?search=${encodeURIComponent(names.service)}`, "Novo servico", "Cadastrar servico");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Nome", names.service);
  await fillField(dialog, "Preco base", "50000");
  await fillField(dialog, "SLA dias", "5");
  await fillField(dialog, "Horas estimadas", "12");
  await fillField(dialog, "Comissao %", "10");
  await fillField(dialog, "Margem bruta %", "60");
  await fillField(dialog, "Descricao", "Servico QA criado pelo smoke test.");
  await submitDialog(page, "Salvar servico");
  await expectText(page, names.service);

  await openEditFromRow(page, names.service);
  await fillField(page.getByRole("dialog"), "Nome", names.serviceEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.serviceEdited);
}

async function createContract(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, "/contracts?size=100", "Novo contrato", "Cadastrar contrato");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Plano", names.contract);
  await choosePremiumSelect(page, dialog, "clientId", names.clientEdited);
  await chooseTodayDate(page, dialog, "startDate");
  await chooseRelativeDate(page, dialog, "endDate", 12);
  await chooseServiceCard(dialog, names.serviceEdited);
  await fillField(dialog, "Taxa de Implementacao", "100000");
  await fillField(dialog, "Desconto", "50000");
  await fillField(dialog, "Vencimento", "10");
  await expect(dialog.locator("strong").filter({ hasText: "6.500" }).first()).toBeVisible();
  await submitDialog(page, "Salvar contrato");
  await expectText(page, names.contract);

  await openEditFromRow(page, names.contract);
  await fillField(page.getByRole("dialog"), "Plano", names.contractEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.contractEdited);
}

async function createProject(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, `/projects?search=${encodeURIComponent(names.project)}`, "Novo projeto", "Cadastrar projeto");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Nome do projeto", names.project);
  await choosePremiumSelect(page, dialog, "clientId", names.clientEdited);
  await choosePremiumSelect(page, dialog, "serviceId", names.serviceEdited);
  await fillField(dialog, "Progresso", "20");
  await fillField(dialog, "Orcamento", "300000");
  await fillField(dialog, "Custo estimado", "120000");
  await fillField(dialog, "Custo real", "100000");
  await submitDialog(page, "Salvar projeto");
  await expectText(page, names.project);

  await openEditFromRow(page, names.project);
  await fillField(page.getByRole("dialog"), "Nome do projeto", names.projectEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.projectEdited);
}

async function createTask(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, `/tasks?search=${encodeURIComponent(names.task)}`, "Nova tarefa", "Cadastrar tarefa");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Titulo", names.task);
  await choosePremiumSelect(page, dialog, "projectId", names.projectEdited);
  await chooseTodayDate(page, dialog, "dueDate");
  await submitDialog(page, "Salvar tarefa");
  await expectText(page, names.task);

  await openEditFromRow(page, names.task);
  await fillField(page.getByRole("dialog"), "Titulo", names.taskEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.taskEdited);
}

async function createDelivery(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, "/deliveries?size=100", "Nova entrega", "Cadastrar entrega");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Titulo", names.delivery);
  await fillField(dialog, "Responsavel", "QA Operacao");
  await chooseTodayDate(page, dialog, "deadline");
  await choosePremiumSelect(page, dialog, "clientId", names.clientEdited);
  await choosePremiumSelect(page, dialog, "projectId", names.projectEdited);
  await choosePremiumSelect(page, dialog, "contractId", names.contractEdited);
  await choosePremiumSelect(page, dialog, "serviceId", names.serviceEdited);
  await submitDialog(page, "Salvar entrega");
  await expectText(page, names.delivery);

  await openEditFromRow(page, names.delivery);
  await fillField(page.getByRole("dialog"), "Titulo", names.deliveryEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.deliveryEdited);
}

async function createFinanceEntry(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, "/finance?size=100", "Novo lancamento", "Cadastrar lancamento");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Descricao", names.finance);
  await fillField(dialog, "Valor", "75000");
  await chooseTodayDate(page, dialog, "due");
  await choosePremiumSelect(page, dialog, "clientId", names.clientEdited);
  await choosePremiumSelect(page, dialog, "contractId", names.contractEdited);
  await choosePremiumSelect(page, dialog, "projectId", names.projectEdited);
  await choosePremiumSelect(page, dialog, "serviceId", names.serviceEdited);
  await submitDialog(page, "Salvar lancamento");
  await expectText(page, names.finance);

  await openEditFromRow(page, names.finance);
  await fillField(page.getByRole("dialog"), "Descricao", names.financeEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.financeEdited);
}

async function createTeamMember(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, `/team?search=${encodeURIComponent(names.team)}`, "Novo membro", "Cadastrar membro");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Nome", names.team);
  await fillField(dialog, "Email", `qa.team.${Date.now()}@vertxmidia.test`);
  await fillField(dialog, "Telefone", "11977776666");
  await fillField(dialog, "Tarefas", "2");
  await fillField(dialog, "Concluidas", "1");
  await fillField(dialog, "Performance", "50");
  await fillField(dialog, "Capacidade mensal", "120");
  await fillField(dialog, "Custo hora", "8000");
  await submitDialog(page, "Salvar membro");
  await expectText(page, names.team);

  await openEditFromRow(page, names.team);
  await fillField(page.getByRole("dialog"), "Nome", names.teamEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.teamEdited);
}

async function createCommission(page: Page, names: Record<string, string>) {
  await openCreateDialog(page, "/commissions?size=100", "Nova comissao", "Cadastrar comissao");
  const dialog = page.getByRole("dialog");
  await choosePremiumSelect(page, dialog, "memberId", names.teamEdited);
  await fillField(dialog, "Cliente", names.commissionClient);
  await choosePremiumSelect(page, dialog, "contractId", names.contractEdited);
  await fillField(dialog, "Valor da venda", "650000");
  await fillField(dialog, "Percentual", "10");
  await fillField(dialog, "Meta", "1");
  await submitDialog(page, "Salvar comissao");
  await expectText(page, names.commissionClient);

  await openEditFromRow(page, names.commissionClient);
  await fillField(page.getByRole("dialog"), "Cliente", names.commissionClientEdited);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, names.commissionClientEdited);
}

async function createGoal(page: Page, date: string, stamp: number) {
  const target = 25_000 + (stamp % 10_000);
  const editedTarget = target + 1;
  const targetLabel = formatBrl(target);
  const editedTargetLabel = formatBrl(editedTarget);
  await openCreateDialog(page, `/goals?from=${date}&to=${date}`, "Nova meta", "Cadastrar meta");
  const dialog = page.getByRole("dialog");
  await chooseTodayDate(page, dialog, "date");
  await fillField(dialog, "Alvo", String(target));
  await fillField(dialog, "Atual", "0");
  await submitDialog(page, "Salvar meta");
  const createdGoalRow = page.getByRole("row").filter({ hasText: "Faturamento" }).filter({ hasText: targetLabel }).first();
  await expect(createdGoalRow).toBeVisible({ timeout: 20_000 });

  await chooseActionFromContainer(page, createdGoalRow, /^Editar$/);
  await fillField(page.getByRole("dialog"), "Alvo", String(editedTarget));
  await submitDialog(page, "Salvar alteracoes");
  const editedGoalRow = page.getByRole("row").filter({ hasText: "Faturamento" }).filter({ hasText: editedTargetLabel }).first();
  await expect(editedGoalRow).toBeVisible({ timeout: 20_000 });
  await chooseActionFromContainer(page, editedGoalRow, /Excluir|Arquivar|Cancelar|Inativar|Remover/);
  await expect(page.getByRole("row").filter({ hasText: editedTargetLabel })).toHaveCount(0, { timeout: 20_000 });
}

async function createCalendarMeeting(page: Page, stamp: number, date: string) {
  const title = `QA Reuniao ${stamp}`;
  const editedTitle = `QA Reuniao ${stamp} Editada`;
  await openCreateDialog(page, `/calendar?month=${date.slice(0, 7)}&date=${date}&view=month`, "Nova reuniao", "Nova reuniao");
  const dialog = page.getByRole("dialog");
  await fillField(dialog, "Titulo do evento", title);
  await chooseTodayDate(page, dialog, "date");
  await chooseTodayDate(page, dialog, "endDate");
  await chooseTime(page, dialog, "startTime", "10", "00");
  await chooseTime(page, dialog, "endTime", "11", "00");
  await fillField(dialog, "Responsavel", `QA Agenda ${stamp}`);
  await fillField(dialog, "Link da reuniao", "https://meet.example.test/qa");
  await fillField(dialog, "Descricao", "Reuniao criada pelo smoke test.");
  await submitDialog(page, "Salvar reuniao");
  await expectText(page, title);

  const card = actionableArticle(page, title);
  await expect(card).toBeVisible({ timeout: 20_000 });
  await chooseActionFromContainer(page, card, /^Editar evento$/);
  await fillField(page.getByRole("dialog"), "Titulo do evento", editedTitle);
  await submitDialog(page, "Salvar alteracoes");
  await expectText(page, editedTitle);

  const editedCard = actionableArticle(page, editedTitle);
  await expect(editedCard).toBeVisible({ timeout: 20_000 });
  await chooseActionFromContainer(page, editedCard, /^Cancelar evento$/);
  await expect(actionableArticle(page, editedTitle).filter({ hasText: "Cancelada" }).first()).toBeVisible({
    timeout: 20_000
  });
}

async function login(page: Page, creds: Credentials) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(creds.email);
  await page.locator('input[name="password"]').fill(creds.password);
  await page.getByRole("button", { name: /Entrar na plataforma/ }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
}

async function openCreateDialog(page: Page, route: string, buttonName: string, dialogName: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await page.getByRole("button", { name: buttonName }).click();
  await expect(page.getByRole("dialog", { name: dialogName })).toBeVisible({ timeout: 10_000 });
}

async function openEditFromRow(page: Page, rowText: string) {
  await chooseRowAction(page, rowText, /^Editar$/);
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
}

async function deleteByRow(page: Page, route: string, rowText: string, actionName = /Arquivar|Excluir|Inativar|Remover/) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  const targetRow = row(page, rowText);
  await expect(targetRow).toBeVisible({ timeout: 20_000 });
  await chooseRowAction(page, rowText, actionName);
  await expect(page.getByRole("row").filter({ hasText: rowText })).toHaveCount(0, { timeout: 20_000 });
}

function row(page: Page, text: string) {
  return page.getByRole("row").filter({ hasText: text }).first();
}

async function chooseRowAction(page: Page, rowText: string, actionName: RegExp) {
  await chooseActionFromContainer(page, row(page, rowText), actionName);
}

async function chooseActionFromContainer(page: Page, container: Locator, actionName: RegExp) {
  const directAction = container.getByRole("button", { name: actionName }).first();
  if (await directAction.isVisible().catch(() => false)) {
    await directAction.click();
    return;
  }

  await container.getByRole("button", { name: "Acoes" }).click();
  await page.getByRole("menuitem", { name: actionName }).first().click();

  const confirmation = page.getByRole("dialog", { name: /Confirmar|Arquivar|Cancelar|Excluir|Inativar|Remover/ });
  await confirmation.waitFor({ state: "visible", timeout: 1500 }).catch(() => undefined);
  if (await confirmation.isVisible().catch(() => false)) {
    const primaryConfirmButton = confirmation.getByRole("button", { name: /Arquivar|Excluir|Inativar|Remover|Confirmar/ }).first();
    if (await primaryConfirmButton.isVisible().catch(() => false)) {
      await primaryConfirmButton.click();
      return;
    }

    const confirmButton = confirmation.getByRole("button", { name: actionName }).last();
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
  }
}

function actionableArticle(page: Page, text: string) {
  return page.locator("article").filter({ hasText: text }).filter({ has: page.getByRole("button", { name: "Acoes" }) }).first();
}

async function fillField(scope: Locator, label: string, value: string) {
  const accessibleField = scope.getByRole("textbox", { name: label, exact: true }).first();
  if (await accessibleField.isVisible().catch(() => false)) {
    await accessibleField.fill(value);
    return;
  }

  const field = scope.locator("label").filter({ hasText: label }).first();
  await field.locator('input:not([type="hidden"]), textarea').first().fill(value);
}

async function choosePremiumSelect(page: Page, scope: Locator, name: string, optionLabel: string) {
  const hiddenInput = scope.locator(`input[name="${name}"]`).first();
  const wrapper = hiddenInput.locator("xpath=..");
  await wrapper.locator('button[aria-haspopup="listbox"]').first().click();

  const searchInput = page.locator('input[placeholder="Buscar opcao..."]').last();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill(optionLabel);
  }

  await page.getByRole("option", { name: new RegExp(escapeRegex(optionLabel)) }).first().click();
}

async function chooseTodayDate(page: Page, scope: Locator, name: string) {
  const wrapper = scope.locator(`input[name="${name}"]`).first().locator("xpath=..");
  await wrapper.locator('button[aria-haspopup="dialog"]').first().click();
  await page.getByRole("dialog", { name: "Selecionar data" }).last().getByRole("button", { name: "Hoje" }).click();
}

async function chooseRelativeDate(page: Page, scope: Locator, name: string, monthsAhead: number) {
  const wrapper = scope.locator(`input[name="${name}"]`).first().locator("xpath=..");
  await wrapper.locator('button[aria-haspopup="dialog"]').first().click();
  const calendar = page.getByRole("dialog", { name: "Selecionar data" }).last();
  for (let index = 0; index < monthsAhead; index += 1) {
    await calendar.getByRole("button", { name: "Proximo mes" }).click();
  }
  await calendar.getByRole("button", { name: String(new Date().getDate()), exact: true }).first().click();
}

async function chooseServiceCard(scope: Locator, serviceName: string) {
  await scope.getByRole("button", { name: new RegExp(escapeRegex(serviceName)) }).first().click();
}

async function chooseTime(page: Page, scope: Locator, name: string, hour: string, minute: string) {
  const wrapper = scope.locator(`input[name="${name}"]`).first().locator("xpath=..");
  await wrapper.locator('button[aria-haspopup="dialog"]').first().click();
  const timeDialog = page.getByRole("dialog", { name: "Selecionar horario" }).last();
  await timeDialog.locator(".calendar-scrollbar").first().getByRole("button", { name: hour, exact: true }).click();
  await timeDialog.locator(".calendar-scrollbar").nth(1).getByRole("button", { name: minute, exact: true }).click();
}

async function submitDialog(page: Page, buttonName: string) {
  const dialog = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: buttonName }) }).first();
  await dialog.getByRole("button", { name: buttonName }).click();
  await expect(dialog).toHaveCount(0, { timeout: 20_000 });
  await page.waitForLoadState("networkidle").catch(() => undefined);
}

async function expectText(page: Page, text: string) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 20_000 });
}

function isoDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

type Credentials = {
  email: string;
  password: string;
  apiBaseUrl: string;
};

function readRootEnvCredentials(): Credentials | null {
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
  const timeout = setTimeout(() => controller.abort(), 5_000);

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
