# AGENTS.md — VertX Midia CRM

Este projeto é um CRM interno para uma assessoria de marketing.

O objetivo do sistema é controlar:

* clientes
* contratos
* serviços
* projetos
* tarefas
* entregas/Kanban
* agenda
* faturamento
* financeiro
* equipe
* comissões
* metas
* dashboard
* gráficos
* leads
* pipeline comercial

O sistema deve ser simples, interno, rápido, funcional e coerente.

Não implementar agora:

* Meta Ads
* WhatsApp
* email marketing
* webhooks
* automações externas avançadas
* realtime complexo
* presence system
* activity feed avançado visível
* auditoria visual no menu
* dashboards duplicados
* multitenancy avançado

Se algo disso existir internamente, pode permanecer no código, mas não deve aparecer como funcionalidade principal no frontend.

---

## Stack do projeto

### Backend

* Java 21+
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* PostgreSQL via Supabase
* Flyway ou Liquibase
* Maven
* JWT/cookies HttpOnly
* BCrypt se autenticação própria for usada

### Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* TanStack Query
* TanStack Table
* Zustand
* Recharts
* Framer Motion
* Design System próprio
* AppShell/sidebar
* Command Palette

---

## Banco de dados e Supabase

Este projeto usa Supabase como banco principal, utilizando PostgreSQL.

O Supabase será responsável por:

* banco PostgreSQL
* armazenamento dos dados do CRM
* storage para arquivos, contratos, imagens e documentos, se necessário
* backups e gerenciamento do banco
* autenticação apenas se fizer sentido futuramente
* Row Level Security apenas quando necessário

Mesmo usando Supabase, a regra de negócio principal deve ficar no backend Java com Spring Boot.

O Supabase deve ser usado principalmente como banco PostgreSQL, e o backend Java deve se conectar através da `DATABASE_URL`.

### Regras importantes de Supabase

* Não colocar regras de negócio principais diretamente no Supabase.
* Não expor `SUPABASE_SERVICE_ROLE_KEY` no frontend.
* Usar `SUPABASE_ANON_KEY` no frontend apenas quando necessário.
* Guardar chaves no `.env`.
* Nunca commitar `.env`.
* Usar migrations para controlar mudanças no banco.
* Ativar RLS apenas quando o frontend acessar tabelas diretamente.
* Se o acesso ao banco for apenas pelo backend Java, controlar permissões pelo backend.

### Variáveis de ambiente esperadas

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/postgres
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
JWT_SECRET=sua_chave_jwt_segura
APP_ALLOWED_ORIGINS=http://localhost:3000
APP_REQUIRE_AUTH=true
```

Nunca imprimir secrets em logs.

---

## Comandos principais

### Backend

Rodar backend:

```bash
mvn spring-boot:run
```

Compilar:

```bash
mvn clean compile
```

Testar:

```bash
mvn test
```

Package:

```bash
mvn package
```

### Frontend

Entrar na pasta:

```bash
cd frontend
```

Rodar frontend:

```bash
npm run dev
```

Validar TypeScript:

```bash
npm run typecheck
```

Rodar lint:

```bash
npm run lint
```

Rodar testes:

```bash
npm run test
```

Build:

```bash
npm run build
```

Auditoria:

```bash
npm audit --audit-level=moderate
```

---

## Validação obrigatória antes de concluir tarefas

Sempre que alterar código relevante, rodar quando possível:

Backend:

```bash
mvn clean compile
mvn test
mvn package
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run lint
npm run test
npm run build
npm audit --audit-level=moderate
```

Se algum comando falhar:

* informar qual comando falhou;
* explicar a causa;
* corrigir se estiver dentro do escopo;
* não afirmar que passou se não passou.

---

## Regra principal do frontend

Tudo que aparece no frontend precisa funcionar de verdade.

Se uma funcionalidade não existe, não deve aparecer.

Se uma rota foi removida, não deve aparecer.

Se um botão não funciona, não deve aparecer.

Se um formulário não salva, não deve parecer pronto.

Se não existe backend funcional, não deve aparecer como funcionalidade final.

Verificar sempre:

* sidebar
* command palette
* breadcrumbs
* cards do dashboard
* atalhos rápidos
* botões
* formulários
* modais
* menus dropdown
* filtros
* ações de tabela
* rotas diretas

Nenhum item visível pode apontar para algo quebrado, inexistente ou incompleto.

---

## Estrutura ideal da sidebar

A sidebar principal deve seguir este modelo:

### Visão Geral

* Dashboard
* Gráficos

### Comercial

* Leads
* Pipeline
* Clientes
* Contratos

### Operação

* Serviços
* Projetos
* Entregas
* Tarefas
* Agenda

### Financeiro

* Faturamento
* Financeiro
* Comissões
* Metas

### Equipe

* Equipe
* Configurações

Ocultar da interface principal:

* Auditoria
* Activity Feed avançado
* Dash Operacional
* Dash Executivo
* Integrações externas
* Webhooks
* Meta Ads
* WhatsApp
* Email marketing
* Realtime avançado
* Presence system
* Notificações avançadas

---

## Fluxo central do CRM

O CRM deve seguir este fluxo lógico:

```text
Lead → Pipeline → Cliente → Contrato → Serviço → Projeto → Tarefas/Entregas → Faturamento → Financeiro → Comissões/Metas → Dashboard/Gráficos
```

Tudo que acontece em um módulo deve alimentar outros módulos quando fizer sentido.

Exemplo:

1. Um lead é cadastrado.
2. O lead entra no pipeline.
3. Se fechar, vira cliente.
4. O cliente recebe um contrato.
5. O contrato é vinculado a um serviço.
6. O contrato pode gerar projeto.
7. O projeto gera tarefas.
8. As tarefas aparecem no Kanban/Entregas.
9. O contrato gera faturamento.
10. Pagamentos alimentam financeiro.
11. Contrato pode gerar comissão.
12. Metas usam dados reais.
13. Dashboard e gráficos consolidam tudo.

---

## Regras de negócio principais

### Contratos

Fórmula obrigatória:

```text
valor total = (mensalidade × quantidade de meses) + taxa de implementação - desconto
```

Validações:

* mensalidade não pode ser negativa;
* quantidade de meses deve ser maior ou igual a 1;
* taxa de implementação não pode ser negativa;
* desconto não pode ser negativo;
* desconto não pode ser maior que subtotal;
* backend deve recalcular antes de salvar;
* frontend deve exibir o valor total calculado;
* valor total não deve ser editado manualmente quando puder ser calculado.

### Faturamento

* contratos ativos geram previsão de receita;
* mensalidade conta como receita recorrente/MRR;
* taxa de implementação conta como receita não recorrente;
* cobranças podem ter status: `pendente`, `pago`, `vencido`, `cancelado`;
* não quebrar com cliente nulo;
* status/enums devem bater entre frontend e backend.

### Projetos e tarefas

* projeto pode estar vinculado a cliente, contrato e serviço;
* projeto pode ter várias tarefas;
* progresso do projeto = tarefas concluídas / total de tarefas × 100;
* tarefa atrasada deve ser destacada;
* tarefa concluída deve registrar data de conclusão;
* tarefa concluída deve atualizar progresso do projeto quando essa lógica existir.

### Kanban/Entregas

Colunas padrão:

* Backlog
* A fazer
* Em andamento
* Revisão
* Concluído

Regras:

* mover card altera status real;
* mover para concluído conclui a tarefa;
* salvar alteração no backend;
* se falhar, reverter estado visual;
* invalidar cache corretamente;
* não perder estado após refresh.

### Agenda

* reunião deve ter data, horário inicial e horário final;
* horário final não pode ser menor que horário inicial;
* reunião pode se vincular a cliente, lead ou projeto;
* reunião cancelada não conta como compromisso ativo;
* reuniões da semana aparecem no dashboard quando aplicável.

### Comissões

* comissão pode ser percentual ou valor fixo;
* comissão percentual = valor base × percentual;
* comissão fixa = valor fixo;
* não permitir valores negativos;
* comissão pendente aparece no dashboard quando aplicável.

### Metas

* progresso = valor atual / valor alvo × 100;
* metas devem usar dados reais quando possível;
* tipos devem bater entre frontend e backend.

---

## CRUD obrigatório

Para cada módulo principal, garantir quando aplicável:

* listar;
* criar;
* editar;
* excluir, cancelar ou desativar;
* visualizar detalhes;
* buscar;
* filtrar;
* validar campos;
* salvar no backend;
* atualizar tela após salvar;
* mostrar toast de sucesso;
* mostrar toast de erro;
* tratar loading;
* tratar estado vazio;
* tratar erro de API;
* invalidar cache do TanStack Query;
* não duplicar dados;
* não quebrar com dados nulos.

Módulos prioritários:

1. Clientes
2. Contratos
3. Serviços
4. Projetos
5. Tarefas
6. Entregas/Kanban
7. Faturamento
8. Dashboard
9. Financeiro
10. Comissões
11. Metas
12. Leads/Pipeline
13. Agenda
14. Equipe
15. Configurações

---

## Padrões de frontend

Usar TypeScript com tipagem forte.

Evitar:

* `any` desnecessário;
* componentes gigantes;
* código duplicado;
* imports não utilizados;
* botões sem `onClick`;
* formulários sem `onSubmit`;
* inputs desconectados do estado;
* dados mockados em produção;
* links para rotas inexistentes.

Usar:

* TanStack Query para busca/cache;
* invalidação de cache após criar/editar/excluir;
* Zustand apenas para estado global realmente necessário;
* componentes reutilizáveis do design system;
* loading states;
* empty states;
* error states;
* toasts de sucesso/erro;
* formulários com validação.

---

## Padrões de backend

Usar:

* controllers claros;
* services para regras de negócio;
* DTOs para entrada/saída;
* validações no backend;
* repositories apenas para acesso a dados;
* exception handlers consistentes;
* status HTTP corretos;
* logs úteis sem expor dados sensíveis.

Evitar:

* regra de negócio no controller;
* confiar apenas no frontend;
* endpoints sem validação;
* delete físico quando quebrar relacionamentos;
* responses gigantes desnecessárias;
* N+1 queries;
* expor stack trace para o usuário.

---

## Formatação de campos

Aplicar quando necessário:

* CPF: `000.000.000-00`
* CNPJ: `00.000.000/0000-00`
* Telefone: `(11) 99999-9999`
* CEP: `00000-000`
* Moeda: `R$ 0.000,00`
* Porcentagem: `00%`
* Data: `dd/mm/yyyy`

Regras:

* formatar ao digitar;
* não quebrar cursor;
* sanitizar antes de enviar ao backend;
* salvar no formato esperado pelo backend;
* validar no frontend e backend.

---

## Design system e identidade visual

Cores oficiais:

* Roxo principal: `#6a0dad`
* Roxo secundário: `#ea59dc`
* Preto: `#090909`

O CRM deve parecer:

* limpo;
* rápido;
* profissional;
* interno;
* premium;
* fácil de usar.

Revisar sempre:

* sidebar;
* header;
* cards;
* tabelas;
* filtros;
* selects;
* dropdowns;
* date pickers;
* modais;
* inputs;
* command palette;
* Kanban;
* gráficos;
* estados vazios;
* loading states;
* skeletons.

Nenhum componente deve parecer genérico ou fora do design system.

---

## Responsividade

Corrigir:

* elementos saindo da div;
* textos estourando;
* cards desalinhados;
* tabelas com overflow ruim;
* dropdowns fora da tela;
* popovers cortados;
* date pickers quebrados;
* filtros desalinhados;
* modais maiores que a tela;
* sidebar quebrada;
* Kanban inutilizável em telas menores.

Não resolver apenas com `overflow-hidden`.
Corrigir a causa quando possível.

Usar quando necessário:

* `min-w-0`
* `max-w`
* `truncate`
* `break-words`
* `flex-wrap`
* grids responsivas
* containers fluidos
* scroll interno controlado

---

## Performance

Garantir:

* paginação em listas grandes;
* evitar carregar tudo no dashboard;
* evitar queries duplicadas;
* cache correto com TanStack Query;
* invalidação correta após CRUD;
* filtros com debounce quando necessário;
* tabelas performáticas;
* Kanban sem travar;
* gráficos sem peso desnecessário;
* backend com DTOs e paginação quando necessário.

---

## Segurança

Preservar:

* autenticação;
* cookies HttpOnly;
* rotas protegidas;
* permissões existentes;
* validações backend;
* CORS correto;
* headers de segurança;
* tratamento seguro de uploads;
* não exposição de dados sensíveis;
* `.env` fora do Git.

Não alterar autenticação de forma agressiva sem explicar antes.

---

## Modo de trabalho do agente

Antes de alterar muito código:

1. Mapear arquivos relevantes.
2. Explicar o problema encontrado.
3. Explicar o plano.
4. Fazer alterações pequenas e seguras.
5. Rodar validações.
6. Corrigir erros.
7. Entregar relatório.

Não fazer refatoração gigante sem necessidade.

Não apagar arquivos em massa.

Não alterar regra de negócio sem explicar.

Não afirmar que algo passou se não passou.

---

## Relatório final esperado

Ao final de cada tarefa importante, informar:

* arquivos alterados;
* problemas encontrados;
* problemas corrigidos;
* comandos executados;
* resultado dos comandos;
* riscos restantes;
* próximos passos recomendados.
