# VertX Midia CRM

CRM operacional da VertX Midia com frontend estático servido pelo Spring Boot e backend Java preparado para PostgreSQL via Supabase.

## Arquitetura

- `src/main/resources/static/index.html`: redirecionador de sessão.
- `src/main/resources/static/login.html`: tela de login.
- `src/main/resources/static/app.html`: tela principal do CRM.
- `src/main/resources/static/assets/styles/crm.css`: estilos da interface.
- `src/main/resources/static/assets/js/pages/login.js`: comportamento do login.
- `src/main/resources/static/assets/js/pages/crm.js`: regras de interação da tela CRM.
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
- Em produção, ative `APP_REQUIRE_AUTH=true` e configure o issuer JWT do Supabase.
- Se o frontend acessar tabelas do Supabase diretamente, habilite RLS e use somente `SUPABASE_ANON_KEY`.
- Se o acesso ao banco ficar apenas pelo Java, centralize autorização e validação no backend.

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- CRUD protegido por JWT: `/api/clients`
- CRUD protegido por JWT: `/api/contracts`
- CRUD protegido por JWT: `/api/deliveries`
- CRUD protegido por JWT: `/api/events`
- CRUD protegido por JWT: `/api/finance-entries`
- CRUD protegido por JWT: `/api/performance-records`
- CRUD protegido por JWT: `/api/goals`
- CRUD protegido por JWT: `/api/team-members`

O frontend usa estes endpoints quando o backend está disponível e mantém fallback local para desenvolvimento.

## Validação

```powershell
.\scripts\check.ps1
```

## Correção de Flyway

Se o Supabase mostrar `Migration checksum mismatch`, significa que uma migration versionada já foi aplicada no banco e depois o arquivo local mudou. Depois de confirmar que o schema atual está correto, rode uma vez:

```powershell
.\scripts\flyway-repair.ps1
```

Depois rode novamente:

```powershell
.\scripts\dev.ps1
```
