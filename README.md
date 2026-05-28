# VertX Midia CRM

CRM operacional da VertX Midia com backend Java/Spring Boot e frontend Next.js/Tailwind, preparado para PostgreSQL/Supabase, Docker e deploy em produção sem multitenancy.

## Arquitetura

- `frontend`: interface Next.js App Router com Tailwind CSS.
- Design system do frontend: primitives em `frontend/components/ui`, command palette, toasts, TanStack Query, Zustand, TanStack Table e Recharts.
- `src/main/java`: API Java com Spring Boot 3, Security, JWT, JPA e módulos de domínio.
- `src/main/resources/db/migration`: migrations Flyway versionadas.
- `docker-compose.yml`: ambiente local completo com PostgreSQL, backend e frontend.
- `Dockerfile`: imagem de produção do backend.
- `frontend/Dockerfile`: imagem de produção do frontend Next.js.
- Supabase entra como PostgreSQL gerenciado, storage e autenticação quando necessário.
- A regra de negócio deve ficar no Java, não em funções, triggers ou policies complexas no Supabase.
- O CRM está organizado em módulos operacionais separados, com auditoria e APIs protegidas por login.

Leia também:

- `docs/ARCHITECTURE.md`
- `docs/SUPABASE.md`
- `docs/QA_CHECKLIST.md`
- `docs/DEPLOYMENT.md`

## Configuração local

1. Edite `.env` com as credenciais reais do Supabase.
2. Use a `DATABASE_URL` do Supabase com `sslmode=require`.
3. Rode o backend:

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
http://localhost:3000
```

Frontend local:

```bash
cd frontend
npm install
npm run dev
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
- Requests recebem `X-Correlation-Id` para rastreabilidade em logs e respostas.

## Observabilidade

Endpoints públicos de saúde:

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/health/readiness
curl http://localhost:8080/actuator/health/liveness
```

Endpoints protegidos por JWT com role `ADMIN` ou `GESTOR`:

```text
GET /actuator/metrics
GET /actuator/metrics/{metricName}
```

Os logs incluem `correlationId` quando o cliente envia `X-Correlation-Id`; se o cabeçalho não vier, o backend gera um UUID.

## Endpoints iniciais

- `GET /api/health`
- `GET /actuator/health`
- `GET /actuator/metrics` protegido por role privilegiada
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

O frontend usa estes endpoints como fonte principal de dados. Tokens JWT e refresh token ficam em cookies `HttpOnly`, com renovação feita pelo proxy do Next.js; `localStorage` não deve armazenar dados sensíveis ou regras críticas.

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

## Docker Compose local

```bash
docker compose up --build
```

Serviços:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

O compose usa credenciais locais de desenvolvimento. Para produção, configure variáveis reais no provedor e não reaproveite senhas do exemplo.

## Validação

```powershell
.\scripts\check.ps1
```

Esse comando valida o frontend Next.js, roda a suíte Maven e gera o package final.

Validação da stack atual:

```bash
mvn "-Dmaven.resources.skip=true" test
cd frontend
npm run typecheck
npm run lint
npm run test
npm run build
```

O CI oficial fica em `.github/workflows/ci.yml` e executa backend, frontend, auditoria npm e build das imagens Docker.

## Correção de Flyway

Se o Supabase mostrar `Migration checksum mismatch`, significa que uma migration versionada já foi aplicada no banco e depois o arquivo local mudou. Depois de confirmar que o schema atual está correto, rode uma vez:

```powershell
.\scripts\flyway-repair.ps1
```

Depois rode novamente:

```powershell
.\scripts\dev.ps1
```
