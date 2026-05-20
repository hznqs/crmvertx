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
    ├── client
    └── operations
```

- `domain`: entidades, enums e conversores do domínio.
- `application`: casos de uso e regra de negócio.
- `dto`: contratos de entrada e saída da API.
- `infrastructure`: repositórios e integração com persistência.
- `web`: controllers HTTP.
- `audit`: registra criação, edição e exclusão dos módulos operacionais.
- `operations`: módulos escaláveis do CRM, como contratos, entregas, agenda, financeiro, performance, metas e equipe.

Os módulos operacionais seguem uma base comum: cada entidade tem tabela própria, repositório JPA próprio e controller HTTP protegido por autenticação.

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
- `app.html`: área principal do CRM.
- `core`: clientes de API, autenticação e utilitários compartilhados.
- `pages`: comportamento específico das telas.
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

## Escalabilidade

- Novos módulos devem seguir o padrão `domain`, `infrastructure`, `application` e `web`.
- Regras comerciais ficam em serviços Java, não no Supabase.
- Consultas importantes devem usar índices e paginação quando o volume crescer.
- Fluxos sensíveis devem registrar auditoria.
- Migrations Flyway são a fonte de verdade do schema.
