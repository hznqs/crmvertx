# VertX Midia CRM

CRM operacional da VertX Midia com frontend estático servido pelo Spring Boot e backend Java preparado para PostgreSQL via Supabase/Railway.

## Arquitetura

- `src/main/resources/static/index.html`: redirecionador de sessão.
- `src/main/resources/static/login.html`: tela de login.
- `src/main/resources/static/app.html`: tela principal do CRM.
- `src/main/resources/static/assets/styles/crm.css`: estilos da interface.
- `src/main/resources/static/assets/js/pages/login.js`: comportamento do login.
- `src/main/resources/static/assets/js/pages/crm.js`: orquestrador principal da tela CRM.
- `src/main/resources/static/assets/js/pages/*.js`: módulos de UI por área, como dashboard, clientes, kanban, contratos, financeiro, agenda, equipe, metas, documentos, comissões, ranking, executivo, perfil, configurações e auditoria.
- `src/main/resources/static/assets/js/core/api.js`: cliente HTTP para a API Java.
- `src/main/resources/static/assets/js/core/auth.js`: sessão, token e logout.
- `src/main/resources/static/assets/js/config/tailwind.config.js`: tema Tailwind da interface.
- `src/main/java`: API Java com Spring Boot.
- `src/main/resources/db/migration`: migrations Flyway versionadas.
- Supabase entra como PostgreSQL gerenciado, storage e autenticação quando necessário.
- A regra de negócio deve ficar no Java, não em funções, triggers ou policies complexas no Supabase.
- O CRM está organizado em módulos operacionais separados, com auditoria e APIs protegidas por login.

Leia também:

- `docs/ARCHITECTURE.md`
- `docs/SUPABASE.md`
- `docs/QA_CHECKLIST.md`

## Configuração local

1. Edite `.env` com as credenciais reais do Supabase.
2. Use a `DATABASE_URL` do Supabase com `sslmode=require`.
3. Rode a aplicação:

```bash
mvn spring-boot:run
```

No Windows, também pode usar:

```powershell
.\scripts\dev.ps1
```

Healthcheck:

```bash
curl http://localhost:8080/api/health
```

O backend usa `server.port=${PORT:8080}`. Em Railway, a plataforma injeta `PORT`; localmente a porta padrão continua `8080`.

Interface:

```text
http://localhost:8080
```

Login inicial:

```text
Email: valor de ADMIN_EMAIL no .env
Senha: valor de ADMIN_PASSWORD no .env
```

Troque `ADMIN_PASSWORD` antes de usar em produção.

## Segurança

- Nunca commite `.env`.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Em produção, configure `JWT_SECRET` forte e mantenha `APP_REQUIRE_AUTH=true`.
- Configure `APP_ALLOWED_ORIGINS` com origens exatas ou padrões controlados, por exemplo `https://*.up.railway.app`.
- Configure `APP_CSP_CONNECT_SRC` quando o frontend precisar chamar uma API em outro domínio.
- O frontend não acessa buckets/tabelas do Supabase diretamente; uploads passam pela API Java.
- Centralize autorização, validação e auditoria no backend.

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET /api/auth/me`
- `GET /api/dashboard/metrics`
- `GET /api/dashboard/revenue-chart`
- `GET /api/dashboard/meetings-chart`
- CRUD protegido por JWT: `/api/clients`
- Atualização de fase Kanban: `PATCH /api/clients/{id}/phase`
- CRUD protegido por JWT: `/api/contracts`
- CRUD protegido por JWT: `/api/deliveries`
- Atualização de status de entrega: `PATCH /api/deliveries/{id}/status`
- CRUD protegido por JWT: `/api/events`
- CRUD protegido por JWT: `/api/finance-entries`
- CRUD protegido por JWT: `/api/performance-records`
- CRUD protegido por JWT: `/api/goals`
- CRUD protegido por JWT: `/api/team-members`
- Uploads backend-only: `/api/uploads`
- Auditoria: `/api/audit`
- Organização e configurações: `/api/organization`, `/api/settings`
- Comissões/ranking: `/api/commission-sales`

O frontend usa estes endpoints como fonte principal de dados. `localStorage` fica restrito a tokens JWT, refresh token e preferências visuais.

## Deploy Railway

Configure as variáveis no serviço:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database?sslmode=require
JWT_SECRET=troque-por-um-segredo-longo
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=SenhaForte123
APP_ALLOWED_ORIGINS=https://*.up.railway.app
APP_CSP_CONNECT_SRC=
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-apenas-backend
SUPABASE_STORAGE_BUCKET=crm-documents
DB_POOL_INITIALIZATION_FAIL_TIMEOUT=1
```

O `Dockerfile` gera o jar com Maven e o Railway executa a aplicação na porta injetada em `PORT`.

## Validação

```powershell
.\scripts\check.ps1
```

Esse comando valida todos os JavaScript, roda a suíte Maven e gera o package final.

## Correção de Flyway

Se o Supabase mostrar `Migration checksum mismatch`, significa que uma migration versionada já foi aplicada no banco e depois o arquivo local mudou. Depois de confirmar que o schema atual está correto, rode uma vez:

```powershell
.\scripts\flyway-repair.ps1
```

Depois rode novamente:

```powershell
.\scripts\dev.ps1
```
