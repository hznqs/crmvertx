# Supabase

O Supabase entra neste projeto como PostgreSQL gerenciado, storage, backups e autenticação quando fizer sentido. A regra de negócio principal deve continuar no backend Java.

Atualmente o login do CRM é próprio no backend Java, com usuários em `app_users`, senha BCrypt e JWT emitido pela API.

As tabelas são criadas automaticamente pelo Flyway quando a aplicação inicia com a `DATABASE_URL` correta. Voce nao precisa criar as tabelas manualmente no painel do Supabase.

## Onde configurar

Use somente o arquivo `.env` local:

```env
DATABASE_URL=postgresql://usuario:senha@db.seu-projeto.supabase.co:5432/postgres?sslmode=require
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_publica
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_apenas_no_backend
SUPABASE_STORAGE_BUCKET=crm-documents
```

## Regras de segurança

- `SUPABASE_SERVICE_ROLE_KEY` nunca vai para o frontend.
- O frontend deve chamar a API Java em `/api`.
- Uploads seguem sempre `Frontend -> API Java -> Supabase Storage`.
- O service role key fica somente em variável de ambiente do backend.
- RLS só é necessária quando o frontend acessar tabelas diretamente.
- Migrations ficam em `src/main/resources/db/migration`.
- Validações, permissões e regras comerciais ficam em `src/main/java`.
- Nunca edite uma migration que já foi aplicada em produção; crie uma nova versão.

## Storage

Crie um bucket privado para documentos do CRM, por exemplo `crm-documents`.

Fluxo recomendado:

```text
Usuário seleciona arquivo
Frontend envia multipart para /api/uploads
Backend valida autenticação, autorização, tamanho e tipo
Backend envia para Supabase Storage com service role key
Backend salva metadados em crm_uploaded_documents
Frontend lista documentos pela API Java
```

Nunca use `SUPABASE_SERVICE_ROLE_KEY` no navegador e não faça upload direto para o bucket pela UI do CRM.

## Schema atual

O backend cria as tabelas operacionais do CRM diretamente no PostgreSQL do Supabase. A estrutura mantém clientes, contratos, entregas, agenda, financeiro, performance, metas, equipe e auditoria em módulos separados.

Módulos persistidos:

- clientes
- contratos
- entregas
- reuniões e eventos
- financeiro
- performance por cliente
- metas
- equipe
- auditoria
- documentos
- configurações
- organização
- comissões

## Erro de checksum do Flyway

Se aparecer `Migration checksum mismatch`, o banco já tem um histórico diferente do arquivo local. Para ambiente de desenvolvimento, use:

```powershell
.\scripts\flyway-repair.ps1
```

Esse comando não recria tabelas. Ele atualiza a tabela interna `flyway_schema_history` para aceitar os checksums locais atuais. Use somente depois de revisar que as migrations locais representam o schema esperado.

Em produção, a estratégia correta é evitar `repair` como rotina. Se uma tabela, índice ou coluna precisar mudar, crie uma nova migration com o próximo número disponível.
