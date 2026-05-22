# QA e Deploy Checklist

Use esta lista antes de publicar ou depois de alterar módulos críticos.

## Validação local

```powershell
.\scripts\check.ps1
```

O script valida todos os JavaScript com `node --check`, roda `mvn test` e gera o package com `mvn -DskipTests package`.

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
- Faça login com o usuário admin inicial.
- Confirme que `/api/dashboard/metrics` responde autenticado.
- Arraste um card no Kanban e recarregue a página para confirmar persistência.
- Envie um arquivo de teste em Documentos e confirme que aparece na listagem.
- Abra Atividades e confirme registro de login e alterações.

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` nunca deve aparecer no frontend.
- `localStorage` fica limitado a access token, refresh token e preferência visual.
- Endpoints protegidos devem ter `@PreAuthorize`; os testes de arquitetura cobrem essa regra.
- Uploads devem passar pela API Java, nunca direto pelo bucket.
- `JWT_SECRET` precisa ter pelo menos 32 caracteres.

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
  - Atividades
- Em telas vazias, validar empty states.
- Em formulários, validar loading/botão desabilitado e mensagens de erro.
- Em mobile, validar bottom navigation e modais fullscreen.
