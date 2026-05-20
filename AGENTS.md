## Banco de Dados e Supabase

Este projeto deve usar Supabase como banco principal, utilizando PostgreSQL.

### Supabase será responsável por:

- Banco de dados PostgreSQL
- Armazenamento de dados do CRM
- Autenticação, se fizer sentido para o projeto
- Storage para arquivos, contratos, imagens e documentos
- Row Level Security quando necessário
- Backups e gerenciamento do banco

### Backend Java com Supabase

Mesmo usando Supabase, a regra de negócio principal deve ficar no backend Java com Spring Boot.

O Supabase deve ser usado como banco PostgreSQL, e o Java deve se conectar através da `DATABASE_URL`.

Stack recomendada:

- Java 21+
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL via Supabase
- Flyway ou Liquibase
- JWT ou Supabase Auth
- BCrypt para senhas, caso a autenticação seja própria

### Regras importantes

- Não colocar regras de negócio diretamente no Supabase.
- Não expor a `service_role_key` no frontend.
- Usar apenas a `anon_key` no frontend quando necessário.
- Guardar todas as chaves no `.env`.
- Nunca commitar `.env`.
- Usar migrations para controlar mudanças no banco.
- Ativar RLS apenas quando o frontend acessar tabelas diretamente.
- Se o acesso ao banco for apenas pelo backend Java, controlar permissões pelo backend.

### Variáveis de ambiente

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/postgres
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
JWT_SECRET=sua_chave_jwt_segura

