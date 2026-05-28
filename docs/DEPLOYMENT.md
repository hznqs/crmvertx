# Guia de Deploy e Producao

Este guia descreve o caminho recomendado para publicar o Vertxmidia CRM sem multitenancy.

## Ambientes

- `local`: desenvolvimento em `localhost`, podendo usar `docker compose`.
- `staging`: ambiente de homologacao com banco separado.
- `production`: ambiente real com HTTPS, backup, secrets e monitoramento.

Nunca reutilize banco, bucket ou secrets de producao em desenvolvimento.

## Variaveis Obrigatorias

Backend:

```env
PORT=8080
DATABASE_URL=jdbc:postgresql://host:5432/database?sslmode=require
JWT_SECRET=troque-por-um-segredo-com-32-caracteres-ou-mais
APP_REQUIRE_AUTH=true
APP_ALLOWED_ORIGINS=https://crm.seudominio.com
APP_CSP_CONNECT_SRC=https://crm.seudominio.com
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=SenhaForteInicial
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=crm-documents
MANAGEMENT_HEALTH_SHOW_DETAILS=when_authorized
```

Frontend:

```env
NEXT_PUBLIC_APP_NAME=Vertxmidia CRM
CRM_API_BASE_URL=https://api.seudominio.com
```

## Docker Local

```bash
docker compose up --build
```

Valide:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/health/readiness
```

## Pipeline CI

O workflow `.github/workflows/ci.yml` executa:

- `mvn -Dmaven.resources.skip=true test`
- `mvn -DskipTests package`
- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- build das imagens Docker de backend e frontend

Pull requests devem passar pelo pipeline antes de merge.

## Checklist Antes do Deploy

- Rodar `.\scripts\check.ps1`.
- Confirmar que as migrations Flyway nunca foram editadas depois de aplicadas.
- Confirmar `APP_ALLOWED_ORIGINS` restrito ao dominio real.
- Confirmar `JWT_SECRET` forte e fora do repositorio.
- Confirmar `ADMIN_PASSWORD` trocado apos primeiro login.
- Confirmar backup automatico do PostgreSQL.
- Confirmar HTTPS ativo.
- Confirmar `/actuator/health/readiness` com status `UP`.
- Confirmar upload de logo/documento com arquivo PNG/JPG/WEBP/SVG seguro.

## Rollback

- Backend: manter tag da imagem anterior e fazer redeploy da tag estavel.
- Frontend: manter deploy anterior disponivel no provedor.
- Banco: nao reverta migration aplicada sem plano explicito; crie migration compensatoria.
- Dados: restaure backup somente se houver perda/corrupcao confirmada.

## Monitoramento Minimo

- Health/readiness do backend.
- Logs com `X-Correlation-Id`.
- Erros 5xx por minuto.
- Latencia p95 por rota critica.
- Falhas de login.
- Falhas de upload.
- Erros de Flyway no boot.
