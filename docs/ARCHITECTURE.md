# Arquitetura

O projeto é composto por backend Spring Boot e frontend Next.js/Tailwind. O Supabase é tratado como PostgreSQL gerenciado e storage, sempre acessado por serviços backend quando houver regra crítica ou dado sensível.

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
frontend
├── app
│   ├── api/auth
│   ├── dashboard
│   ├── leads
│   ├── clients
│   └── ...
├── components
├── lib
└── public
```

- `app`: rotas App Router, Server Components para leitura de dados e handlers `/api/auth/*` para login/logout sem expor token ao JavaScript do navegador.
- `components`: shell, navegação, tabelas, formulários, cards e componentes interativos reutilizáveis.
- `lib`: clientes de API, actions server-side, tipos, query builders e helpers de autenticação.
- `app/providers.tsx`: providers globais client-side para TanStack Query, command palette e toasts.
- `app/api/realtime/stream`: BFF SSE que conecta o browser ao stream autenticado do backend sem expor JWT ao JavaScript.
- `lib/navigation.ts`: mapa central de navegação, ícones e agrupamento de seções.
- `lib/store/ui-store.ts`: estado global leve com Zustand para chrome da aplicação.
- `lib/store/realtime-store.ts`: estado de presença e eventos recentes recebidos em tempo real.
- `components/ui`: primitives de design system inspiradas em shadcn/ui, com variantes, tokens e acessibilidade.
- `proxy.ts`: renova sessão com refresh token, protege rotas internas e redireciona usuários sem sessão para `/login?next=...`.
- `app/forbidden/page.tsx`: experiência 403 para acesso direto a rotas sem permissão de leitura.
- `lib/auth/session-cookies.ts`: fonte única para nomes, flags e limpeza dos cookies `HttpOnly`.
- `lib/auth/session.ts`: leitura server-side do usuário a partir do JWT em cookie `HttpOnly`.
- `lib/auth/permissions.ts`: matriz espelhada do backend para esconder menus e ações sem permissão no frontend.
- `lib/auth/routes.ts`: fonte única para mapa rota/módulo, destino inicial por role e sanitização de redirect interno.
- `components/auth/permission-gate.tsx`: gate visual reutilizável para ações de escrita/gestão.
- `components/ui/row-actions.tsx`: botões e rótulo de somente leitura padronizados para ações de tabela.
- `components/ui/modal-dialog.tsx`: base reutilizável para modais de formulário, cabeçalho, fechamento e footer.
- Tabelas dos módulos operacionais recebem `ModuleActionPermissions` para separar edição/status (`write`) de exclusão (`manage`).
- Gráficos executivos usam Recharts em componentes client isolados, preservando Server Components para busca de dados.
- Listagens novas devem evoluir para `components/ui/data-table.tsx`, baseada em TanStack Table e preparada para paginação server-side, seleção e ações em massa.
- Testes frontend usam Jest + Testing Library; testes E2E ficam em `tests/e2e` com Playwright.

O frontend legado em `src/main/resources/static` foi removido. A interface oficial é exclusivamente o app Next.js em `frontend`, servido como aplicação separada do backend Spring.

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

## Realtime

- O backend expõe `/api/realtime/stream` com Server-Sent Events autenticado por JWT.
- A emissão de eventos nasce no `AuditService`, que publica ações de autenticação, criação, atualização, exclusão e mudanças sensíveis.
- O frontend consome SSE por `/api/realtime/stream` no Next, preservando cookies `HttpOnly` e evitando token em query string.
- Eventos são tipados como `RealtimeEvent`, agrupados por canais (`activity`, `presence`, `system`) e guardados em replay curto na memória da instância.
- A tela `/activity` exibe uma timeline viva combinando auditoria persistida e eventos realtime recentes.
- Redis já está no `docker-compose.yml` e em `.env.example` para a próxima etapa de broker distribuído. A implementação atual é adequada para uma instância; escala horizontal deve trocar o hub em memória por pub/sub Redis mantendo o mesmo contrato de eventos.

## Escalabilidade

- Novos módulos devem seguir o padrão `domain`, `infrastructure`, `application` e `web`.
- Quando houver entrada/saída HTTP, use DTOs dedicados e validação com Bean Validation.
- Regras comerciais ficam em serviços Java, não no Supabase.
- Consultas importantes devem usar índices e paginação quando o volume crescer.
- Fluxos sensíveis devem registrar auditoria.
- O frontend pode ocultar menus, botões de criação e ações de linha por role, o proxy bloqueia acesso direto a rotas sem leitura e o pós-login escolhe a primeira rota permitida quando o destino solicitado não é autorizado. A autorização definitiva deve permanecer em `@PreAuthorize` e serviços backend.
- Migrations Flyway são a fonte de verdade do schema.
- Migrations aplicadas não devem ser alteradas; correções futuras entram em novas versões `Vx__descricao.sql`.
- O frontend nunca deve ser fonte principal de persistência. Dados permanentes fluem por `Frontend -> API Java -> PostgreSQL/Supabase`.
