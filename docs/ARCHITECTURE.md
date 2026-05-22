# Arquitetura

O projeto usa Spring Boot como aplicação principal e serve o frontend estático pelo próprio backend. O Supabase é tratado como PostgreSQL gerenciado.

## Backend

```text
src/main/java/br/com/vertxmidia/crm
├── config
├── common
└── modules
    ├── audit
    ├── auth
    ├── billing
    ├── client
    ├── dashboard
    ├── organization
    ├── settings
    ├── upload
    └── operations
```

- `domain`: entidades, enums e conversores do domínio.
- `application`: casos de uso e regra de negócio.
- `dto`: contratos de entrada e saída da API.
- `infrastructure`: repositórios e integração com persistência.
- `web`: controllers HTTP.
- `audit`: registra criação, edição, exclusão, login e alterações sensíveis.
- `auth`: autenticação com BCrypt, JWT com `jti`, refresh token, blacklist e controle de tentativas.
- `dashboard`: KPIs agregados e séries para gráficos calculados no backend.
- `organization` e `settings`: dados da empresa, preferências e configurações globais.
- `upload`: documentos enviados pelo backend para Supabase Storage.
- `operations`: módulos escaláveis do CRM, como contratos, entregas, agenda, financeiro, performance, metas, equipe, comissões e ranking.

Os módulos operacionais seguem uma base comum: cada entidade tem tabela própria, repositório JPA próprio e controller HTTP protegido por autenticação.
Controllers não devem conter regra de negócio; eles validam entrada, aplicam autorização e delegam para serviços de aplicação.

## Frontend

```text
src/main/resources/static
├── index.html
├── login.html
├── app.html
└── assets
    ├── styles
    └── js
        ├── config
        ├── core
        └── pages
```

- `index.html`: redireciona para login ou para o CRM conforme a sessão.
- `login.html`: tela isolada de autenticação.
- `app.html`: shell da área principal do CRM.
- `core`: clientes de API, autenticação e utilitários compartilhados.
- `pages`: comportamento específico das telas. O arquivo `crm.js` é mantido como orquestrador e fallback; módulos como `dashboard.js`, `clients.js`, `kanban.js`, `contracts.js`, `finance.js`, `team.js`, `goals.js`, `settings.js`, `profile.js`, `executive.js` e `audit.js` concentram renderização por área.
- `config`: configuração do Tailwind.
- `styles`: CSS da interface.

## Banco

Migrations ficam em `src/main/resources/db/migration`. O backend usa `DATABASE_URL` do `.env` e aplica Flyway ao iniciar.

Tabelas principais:

- `app_users`
- `crm_clients`
- `crm_contracts`
- `crm_deliveries`
- `crm_events`
- `crm_finance_entries`
- `crm_client_performance`
- `crm_goals`
- `crm_team_members`
- `audit_logs`
- `login_attempts`
- `refresh_tokens`
- `jwt_blacklist`
- `crm_uploaded_documents`
- `crm_settings`
- `crm_organization`
- `crm_commission_sales`

## Escalabilidade

- Novos módulos devem seguir o padrão `domain`, `infrastructure`, `application` e `web`.
- Quando houver entrada/saída HTTP, use DTOs dedicados e validação com Bean Validation.
- Regras comerciais ficam em serviços Java, não no Supabase.
- Consultas importantes devem usar índices e paginação quando o volume crescer.
- Fluxos sensíveis devem registrar auditoria.
- Migrations Flyway são a fonte de verdade do schema.
- Migrations aplicadas não devem ser alteradas; correções futuras entram em novas versões `Vx__descricao.sql`.
- O frontend nunca deve ser fonte principal de persistência. Dados permanentes fluem por `Frontend -> API Java -> PostgreSQL/Supabase`.
