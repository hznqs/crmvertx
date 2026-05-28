# Documentacao do Projeto - Vertxmidia CRM

## Prompt master para continuar o projeto

Voce e um Tech Lead e Arquiteto de Software Senior trabalhando no projeto **Vertxmidia CRM**, uma plataforma operacional empresarial para agencia digital, software house e consultoria. O objetivo e evoluir um produto SaaS B2B que une CRM, ERP leve, gestao comercial, gestao operacional, gestao financeira, agenda, dashboards, performance de clientes e auditoria.

Atue com postura senior: preserve o que ja existe, leia o codigo antes de alterar, mantenha arquitetura modular, evite refactors desnecessarios, priorize seguranca, performance, UX premium e codigo limpo.

## Stack atual

### Backend

- Java 21
- Spring Boot 3.3.6
- Spring Security
- OAuth2 Resource Server / JWT
- BCrypt
- Maven
- PostgreSQL
- Supabase
- Flyway
- Spring Data JPA
- Bean Validation

### Frontend

- Next.js 16.2.6
- React 18.3.1
- TypeScript
- Tailwind CSS 3.4.16
- App Router
- Server Components para leitura de dados
- Client Components somente para interatividade
- Cookies HTTP-only para token de acesso
- Nao usar `localStorage` para dados sensiveis ou logicas criticas

## Comandos principais

Backend:

```powershell
cd "C:\Users\Pichau\Desktop\TUDO\LP conceituais\crmvertx"
mvn spring-boot:run
```

Se a porta 8080 estiver ocupada:

```powershell
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

Frontend:

```powershell
cd "C:\Users\Pichau\Desktop\TUDO\LP conceituais\crmvertx\frontend"
npm run dev
```

Validacoes:

```powershell
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Estrutura principal

Backend:

```text
src/main/java/br/com/vertxmidia/crm/
├── common/
├── config/
├── modules/
│   ├── audit/
│   ├── auth/
│   ├── client/
│   ├── dashboard/
│   ├── leads/
│   ├── operations/
│   ├── organization/
│   ├── projects/
│   ├── services/
│   ├── settings/
│   ├── tasks/
│   └── upload/
└── security/
```

Frontend:

```text
frontend/
├── app/
├── components/
├── lib/
└── public/
```

## Principios de arquitetura

- Clean Architecture e separacao de responsabilidades.
- Modulos de dominio separados em packages proprios.
- DTO Pattern para entrada e saida.
- Mapper Pattern para conversao entre entidade e DTO.
- Specification Pattern para filtros server-side.
- Services centralizando regras de negocio.
- Controllers REST com endpoints maduros, previsiveis e paginados.
- Flyway como fonte de verdade para schema.
- Soft delete quando aplicavel.
- Auditoria em eventos criticos.
- Logs e excecoes tratadas por handler global.

## Principios de seguranca

- Seguir OWASP Top 10.
- Nunca confiar em validacao do frontend como regra final.
- Autorizacao e regras criticas sempre no backend.
- JWT em cookie HTTP-only no frontend Next.
- Evitar exposicao de secrets no codigo.
- Evitar `localStorage` para token, permissao, regra critica ou dado sensivel.
- Aplicar RBAC com roles como ADMIN e GESTOR quando necessario.
- Registrar login, logout, falhas, bloqueios, alteracoes, exclusoes e mudancas financeiras.

## UX/UI

Inspiracao: HubSpot, Monday, PipeDrive e SaaS B2B moderno.

Diretrizes:

- Interface escura premium, limpa e operacional.
- Sidebar moderna.
- Tabelas densas, legiveis e responsivas.
- Filtros server-side.
- Skeleton loading em rotas principais.
- Estados vazios claros.
- Indicadores visuais para status, risco e prioridade.
- Evitar excesso de bordas e layouts poluidos.
- Mobile-first.
- Aplicar Lei de Hick, Lei de Fitts, Limiar de Doherty e Estetica-Usabilidade.

## Modulos da ordem principal

1. Leads
2. Clientes
3. Servicos
4. Projetos
5. Tarefas
6. Contratos
7. Financeiro
8. Pipeline
9. Entregas
10. Equipe
11. Comissoes
12. Agenda
13. Metas
14. Dashboard Principal
15. Dashboard Operacional
16. Dashboard Executivo
17. Performance Cliente
18. Auditoria

## Rotas frontend atuais

- `/`
- `/login`
- `/dashboard`
- `/leads`
- `/clients`
- `/services`
- `/projects`
- `/tasks`
- `/pipeline`
- `/contracts`
- `/finance`
- `/deliveries`
- `/team`
- `/commissions`
- `/calendar`
- `/goals`
- `/operational-dashboard`
- `/executive-dashboard`
- `/performance`
- `/billing`
- `/documents`
- `/analytics`
- `/users`
- `/notifications`
- `/integrations`
- `/settings`
- `/profile`
- `/audit`

## Modulos frontend especializados

As rotas principais possuem paginas Next explicitas no App Router, componentes dedicados, filtros, tabelas, cards de metricas e loading states. Nao existe fallback generico de modulo. A leitura de dados acontece prioritariamente via Server Components, chamando o backend com `fetch` e token vindo de cookie HTTP-only.

## Endpoints backend importantes

- `/api/auth/login`
- `/api/auth/logout`

O frontend protege rotas internas no `proxy.ts`: quando nao existe refresh token valido, a navegacao e redirecionada para `/login?next=...`; apos autenticar, o usuario retorna para a rota original usando destino sanitizado. Os nomes e flags dos cookies de sessao ficam centralizados em `frontend/lib/auth/session-cookies.ts`.

A UX de autorizacao usa `frontend/lib/auth/permissions.ts`, `frontend/lib/auth/routes.ts` e `components/auth/permission-gate.tsx` para esconder menus, criacao e acoes de escrita conforme a role. As tabelas tambem diferenciam `write` para editar/status e `manage` para excluir. O `proxy.ts` bloqueia acesso direto a rotas sem permissao de leitura e redireciona para `/forbidden`. O login valida o destino solicitado e redireciona para a primeira area permitida quando a role nao pode ler a rota original. Essa camada nao substitui a seguranca definitiva do backend: todo endpoint sensivel deve continuar protegido por `@PreAuthorize`.

As acoes visuais de tabela devem reutilizar `components/ui/row-actions.tsx` para manter padrao unico de botoes de linha e estado de somente leitura.

Modais de formulario devem reutilizar `components/ui/modal-dialog.tsx`, mantendo os wrappers por modulo apenas quando precisarem preservar nomes/imports existentes ou tamanhos especificos.
- `/api/leads`
- `/api/clients`
- `/api/services`
- `/api/projects`
- `/api/tasks`
- `/api/contracts`
- `/api/finance-entries`
- `/api/deliveries`
- `/api/team-members`
- `/api/commission-sales`
- `/api/events`
- `/api/goals`
- `/api/dashboard/metrics`
- `/api/performance-records`
- `/api/audit`
- `/api/upload`

## Auditoria

O modulo de auditoria usa `/api/audit` e suporta filtros por:

- `userId`
- `action`
- `entity`
- `from`
- `to`
- `page`
- `size`
- `sort`

Campos retornados:

- `id`
- `userId`
- `action`
- `entity`
- `entityId`
- `fieldName`
- `oldValue`
- `newValue`
- `ipAddress`
- `metadata`
- `createdAt`

Acesso restrito a ADMIN e GESTOR.

## Upload e logo

O projeto possui modulo de upload com auditoria de `UPLOAD` e `DELETE`. Qualquer melhoria em envio de logo/imagem deve validar:

- tamanho maximo do arquivo;
- extensoes permitidas;
- MIME type real;
- path traversal;
- erro amigavel no frontend;
- armazenamento seguro;
- auditoria do evento.

## Estado atual conhecido

- Frontend migrado para Next.js/Tailwind.
- Frontend legado em `src/main/resources/static` removido; o backend nao serve mais HTML/CSS/JS estatico do CRM.
- Os modulos principais possuem rotas/paginas explicitas no frontend.
- Fallback generico `/[module]` removido.
- Billing, documentos, analytics, usuarios, notificacoes, integracoes, configuracoes e perfil possuem paginas Next dedicadas.
- A pagina de calendario foi redesenhada.
- Componentes de select/date receberam melhoria visual global em `frontend/app/globals.css`.
- Auditoria foi concluida como modulo 18.
- Upload possui validacao por extensao, MIME declarado e assinatura/conteudo real do arquivo.
- SVG e aceito somente com politica restritiva contra scripts, eventos inline, objetos externos e payloads perigosos.
- Logout do frontend Next chama o backend para revogar access/refresh token antes de limpar cookies.
- Cookies de sessao usam `HttpOnly`, `Secure` em producao e `SameSite=Strict`; login/logout no BFF rejeitam POST cross-origin.
- Middleware do Next renova a sessao com refresh token antes das paginas renderizarem quando o access token esta ausente, invalido ou perto de expirar.
- Guard de rotas internas no Next redireciona usuarios sem sessao para login e limpa cookies inconsistentes.
- Permissoes enterprise centralizadas com o bean `crmPermission`, matriz por modulo/acao, role `SUPORTE` adicionada ao dominio e controllers protegidos migrados para `canRead`, `canWrite` e `canManage`.
- Fluxo `Lead -> Cliente` integrado: converter lead agora cria cliente ativo vinculado por `convertedFromLeadId`, registra historico de fase e auditoria.
- Fluxo `Cliente -> Contrato -> Receita` integrado: contrato ativo sincroniza uma receita automatica pendente no financeiro, com idempotencia por `contractId` + `autoBilling`.
- Fluxo `Contrato/Servico -> Projeto` integrado: contrato ativo sincroniza projeto operacional automaticamente, preserva responsavel/equipe/progresso quando ja existe projeto, calcula custo estimado pela margem do servico quando disponivel e cancela projeto aberto quando contrato deixa de gerar operacao.
- Fluxo `Projeto -> Entregas/Tarefas` integrado: projetos sincronizam entregas a partir das etapas do servico e tarefas a partir do checklist padrao, mantendo idempotencia por projeto, preservando itens manuais e cancelando itens abertos quando o projeto e cancelado.
- Fluxo `Venda/Contrato -> Comissao` integrado: contrato ativo gera ou atualiza comissao pendente para o membro da equipe vinculado ao usuario responsavel pela venda, usando percentual do servico e mantendo idempotencia por contrato.
- Fluxo `Comissao paga -> Despesa` integrado: comissoes com status `PAGA` geram despesa automatica no financeiro, vinculada ao contrato e protegida contra duplicidade por `contractId + type + autoBilling`.
- Dashboards principal, operacional e executivo ampliados com metricas reais de lucro liquido, margem, despesas, impostos, comissoes, entregas abertas/atrasadas e taxa de risco operacional.
- Observabilidade e producao reforcadas: Spring Boot Actuator habilitado para health/info/metrics, correlation id por request, logs com `correlationId`, Docker Compose local, Dockerfile do frontend Next.js e exemplos de ambiente revisados.
- CI/CD preparado com GitHub Actions para testes backend, typecheck/lint/build Next.js, auditoria npm e build das imagens Docker; guia `docs/DEPLOYMENT.md` criado com checklist de producao e rollback.
- Resiliencia frontend reforcada com `error.tsx`, `global-error.tsx`, `not-found.tsx` e headers de seguranca no Next.js.
- Validacoes recentes executadas com sucesso: `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit --audit-level=moderate`.

## Checklist enterprise sem multitenancy

Prioridade 1 - Seguranca:

- Revisar todas as rotas protegidas e roles por modulo.
- Garantir refresh token com rotacao, revogacao e logout.
- Restringir CORS por ambiente.
- Configurar cookies `Secure` em producao.
- Manter upload com validacao de conteudo real.
- Adicionar testes de autorizacao para endpoints criticos.

Prioridade 2 - Fluxos integrados:

- Lead fechado deve gerar Cliente.
- Cliente deve gerar Contrato.
- Contrato ativo deve gerar Receita. Concluido no backend.
- Contrato/Servico deve gerar Projeto. Concluido no backend.
- Projeto deve gerar Tarefas e Entregas. Concluido no backend.
- Venda deve gerar Comissao. Concluido no backend.
- Comissao paga deve gerar Despesa. Concluido no backend.

Prioridade 3 - Produto final:

- Padronizar componentes UI compartilhados.
- Revisar formulários e feedbacks visuais.
- Criar testes E2E dos fluxos principais.
- Criar testes E2E dos fluxos principais.
- Preparar Docker, `.env.example`, README e guia de deploy. Concluido parcialmente com Docker Compose local, Dockerfiles e variaveis exemplo.
- Adicionar health checks e observabilidade. Concluido parcialmente com Actuator, metrics protegidas e correlation id.
- Configurar CI/CD. Concluido parcialmente com GitHub Actions de build/test/audit/docker.

## Regras para proximas alteracoes

- Antes de alterar, ler os arquivos existentes e seguir o padrao local.
- Nao reverter alteracoes nao relacionadas.
- Nao trocar a arquitetura sem necessidade.
- Backend continua Java/Spring; frontend continua Next.js/Tailwind.
- Nao criar CRUD superficial quando o modulo exige regra de negocio.
- Priorizar endpoints server-side paginados e filtros por Specification.
- Evitar duplicacao de componentes no frontend.
- Nao colocar logica critica no client.
- Validar com typecheck, lint, build e testes quando aplicavel.

## Proximas melhorias recomendadas

- Revisar consistencia visual entre todas as telas especializadas.
- Criar biblioteca interna de componentes UI: Table, Filters, MetricCard, Dialog, EmptyState, StatusBadge.
- Padronizar resposta de erro do backend.
- Adicionar Swagger/OpenAPI completo.
- Ampliar testes de service/controller.
- Revisar upload de imagem/logo com mensagens de erro amigaveis.
- Melhorar permissao granular alem de roles basicas.
- Criar testes E2E para login, CRUDs principais, upload, calendario e auditoria.
