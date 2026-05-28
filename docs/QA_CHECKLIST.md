# QA e Deploy Checklist

Use esta lista antes de publicar ou depois de alterar módulos críticos.

## Validação local

```powershell
.\scripts\check.ps1
```

O script roda validações do frontend Next.js, executa testes backend e gera o package.

Validações cobertas:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm audit --audit-level=moderate`
- `mvn -Dmaven.resources.skip=true test`
- `mvn -DskipTests package`

## Banco e Flyway

- Nunca edite migrations já aplicadas em produção.
- Para mudanças de schema, crie sempre uma nova migration `Vx__descricao.sql`.
- Em banco novo, confirme que a aplicação sobe sem erro de Flyway.
- Em banco existente, use `flyway:repair` apenas depois de revisar o histórico e confirmar que o schema esperado já está aplicado.

## Railway

Variáveis obrigatórias:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database?sslmode=require
JWT_SECRET=troque-por-um-segredo-com-32-caracteres-ou-mais
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=SenhaForte123
APP_ALLOWED_ORIGINS=https://*.up.railway.app
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-apenas-backend
SUPABASE_STORAGE_BUCKET=crm-documents
DB_POOL_INITIALIZATION_FAIL_TIMEOUT=1
```

Depois do deploy:

- Acesse `/api/health`.
- Acesse `/actuator/health/readiness`.
- Faça login com o usuário admin inicial.
- Confirme que `/api/dashboard/metrics` responde autenticado.
- Confirme que `/actuator/metrics` exige token com role privilegiada.
- Arraste um card no Kanban e recarregue a página para confirmar persistência.
- Envie um arquivo de teste em Documentos e confirme que aparece na listagem.
- Abra Atividades e confirme registro de login e alterações.

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` nunca deve aparecer no frontend.
- Tokens de sessão ficam em cookies `HttpOnly`; `localStorage` não deve armazenar token, permissão, regra crítica ou dado sensível.
- Rotas internas do frontend devem redirecionar para `/login?next=...` quando não houver sessão válida.
- Após login vindo de uma rota protegida, o usuário deve retornar para a rota original de forma sanitizada.
- Após login com rota não permitida para a role, o usuário deve cair na primeira área legível pelo perfil.
- Menus e botões de criação devem respeitar a matriz de permissões visual do frontend.
- Ações de tabela devem separar `write` para editar/status e `manage` para excluir.
- Acesso direto por URL a um módulo sem `read` deve redirecionar para `/forbidden`.
- Endpoints protegidos devem ter `@PreAuthorize`; os testes de arquitetura cobrem essa regra.
- Uploads devem passar pela API Java, nunca direto pelo bucket.
- `JWT_SECRET` precisa ter pelo menos 32 caracteres.
- `X-Correlation-Id` deve aparecer nas respostas e nos logs.
- Cookies em produção devem ser `Secure`, `HttpOnly` quando aplicável e com `SameSite=Strict`.
- As rotas BFF de login/logout devem rejeitar POST cross-origin.
- O backend Spring deve operar como API pura; `src/main/resources/static`, `/app.html`, `/login.html`, `/index.html` e `/assets/**` não devem existir.

## UX

- Conferir desktop e mobile:
  - Login
  - Dashboard
  - Clientes
  - Kanban
  - Contratos
  - Financeiro
  - Perfil
  - Configurações
  - Auditoria
  - Faturamento
  - Documentos
  - Analytics
  - Usuarios
- Em telas vazias, validar empty states.
- Em formulários, validar loading/botão desabilitado e mensagens de erro.
- Em mobile, validar bottom navigation e modais fullscreen.
- Acessar uma URL inexistente e confirmar pagina 404 amigavel.
- Simular falha de renderizacao em staging e confirmar error boundary com acao de retry.
- Verificar headers do frontend: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e CSP basica.
- Abrir command palette com `Ctrl+K` e validar navegacao por teclado.
- Validar toasts de feedback em logout e acoes globais.
- Conferir graficos Recharts em dashboard e analytics em desktop e mobile.
