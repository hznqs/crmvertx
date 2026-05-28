# Vertxmidia CRM Frontend

Novo frontend em Next.js App Router com Tailwind CSS.

## Rodar localmente

```powershell
cd frontend
npm install
npm run dev
```

Backend esperado:

```text
http://localhost:8080
```

Frontend:

```text
http://localhost:3000
```

Tokens sensíveis devem ser tratados por cookie HTTP-only via camada BFF/auth, nunca por `localStorage`.
