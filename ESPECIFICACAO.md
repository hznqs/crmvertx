# ESPECIFICAÇÃO - PLATAFORMA OPERACIONAL PROFISSIONAL

## VISÃO DO ARQUITETO

Você é um arquiteto de software sênior especialista em:

- CRM empresarial
- ERP leve
- SaaS B2B
- plataformas operacionais
- sistemas para agências digitais
- software houses
- gestão comercial
- gestão financeira
- gestão operacional
- Java Spring Boot
- PostgreSQL
- Supabase
- UI/UX premium
- dashboards executivos
- arquitetura escalável

Seu objetivo é construir uma PLATAFORMA OPERACIONAL PROFISSIONAL COMPLETA para agência digital.

---

## VISÃO GERAL DO NEGÓCIO

A empresa funciona como:

- agência de marketing
- software house
- prestadora de serviços digitais
- consultoria tecnológica
- desenvolvimento de software
- automações
- criação de landing pages
- criação de CRM
- criação de ERP
- tráfego pago
- social media
- branding
- SEO
- gestão operacional

O sistema deve suportar:

- serviços recorrentes
- projetos avulsos
- contratos mensais
- execução operacional
- gestão comercial
- gestão financeira
- gestão estratégica
- relacionamento com clientes
- produtividade operacional
- controle interno da equipe

---

## OBJETIVO PRINCIPAL

Transformar o sistema em uma plataforma operacional completa.

O sistema deve unir:

- CRM
- ERP leve
- gestão operacional
- gestão de projetos
- gestão financeira
- gestão comercial
- gestão de equipe
- dashboards executivos
- gestão de entregas
- performance de clientes

**Tudo integrado.**

O sistema deve possuir **nível empresarial real**.

---

## TECNOLOGIAS

### Backend
- Java 21
- Spring Boot 3
- Spring Security
- JWT
- BCrypt
- Maven
- Flyway
- PostgreSQL
- Supabase

### Frontend
- HTML5
- CSS3
- JavaScript puro

### Arquitetura
- Clean Architecture
- SOLID
- DTO Pattern
- Mapper Pattern
- Specification Pattern
- Response padrão
- logs estruturados
- paginação server-side
- exception handler global
- validações com Bean Validation
- Swagger/OpenAPI
- separação modular
- baixo acoplamento
- alta escalabilidade
- código limpo

---

## REGRAS GERAIS

- Não criar lógica superficial
- Não criar apenas CRUDs
- Não criar campos aleatórios
- Pensar como software empresarial real
- Pensar como plataforma operacional
- Priorizar arquitetura escalável
- Priorizar performance
- Priorizar segurança
- Priorizar manutenção
- Priorizar clareza de domínio
- Priorizar desacoplamento
- Dados importantes devem vir do backend
- Não usar localStorage para lógica crítica
- Todas as regras devem ser centralizadas no backend
- Todas as entidades devem possuir rastreabilidade

---

## ESTRUTURA OBRIGATÓRIA

### Backend

```
src/main/java/br/com/vertxmidia/crm/
├── modules/
│   ├── leads/
│   ├── clients/
│   ├── services/
│   ├── projects/
│   ├── tasks/
│   ├── contracts/
│   ├── deliveries/
│   ├── pipeline/
│   ├── team/
│   ├── commissions/
│   ├── finance/
│   ├── goals/
│   ├── agenda/
│   ├── dashboard/
│   ├── billing/
│   ├── performance/
│   ├── operational/
│   └── audit/
├── security/
├── config/
├── common/
└── exceptions/
```

### Frontend

```
src/main/resources/static/
├── pages/
├── layouts/
├── components/
├── services/
├── styles/
├── utils/
└── assets/
```

---

## PADRÃO FRONTEND

### Inspirações
- Hubspot
- PipeDrive
- Monday
- Notion
- ClickUp

### Componentes & UX
- sidebar moderna
- dashboard interativo
- drag and drop
- tabelas avançadas
- dark mode preparado
- skeleton loading
- toast notifications
- filtros avançados
- paginação server-side
- componentes reutilizáveis
- UX premium
- responsividade total
- animações suaves
- estados vazios inteligentes
- indicadores visuais
- gráficos profissionais

---

## 1. LEADS

### Separação clara:
- lead
- cliente
- contrato
- projeto
- serviço
- entrega

### Fluxo:
Lead → oportunidade → negociação → fechamento → cliente → contrato → projeto → entregas → financeiro

### Campos:
- nome
- empresa
- email
- telefone
- origem
- segmento
- temperatura
- valor potencial
- responsável
- observações
- status
- fase comercial

### Fases:
- NOVO
- CONTATO
- REUNIAO
- PROPOSTA
- NEGOCIACAO
- FECHADO
- PERDIDO

---

## 2. CLIENTES

### Campos:
- empresa
- responsável
- email
- telefone
- CNPJ/CPF
- segmento
- status
- prioridade
- tags
- endereço
- cidade
- estado
- site
- instagram
- observações
- responsável interno
- data entrada
- última interação

### Status:
- ATIVO
- EM_RISCO
- INATIVO
- ENCERRADO

### Regras:
- cliente possui contratos
- cliente possui projetos
- cliente possui financeiro
- cliente possui histórico
- cliente possui agenda
- cliente possui performance

---

## 3. CATÁLOGO DE SERVIÇOS

### Objetivo
Centralizar todos os serviços vendidos.

### Campos:
- nome
- categoria
- descrição
- tipo cobrança
- preço base
- preço recorrente
- recorrente
- prazo médio
- SLA
- checklist padrão
- etapas padrão
- comissão padrão
- custo operacional
- margem estimada
- ativo
- observações

### Categorias:
- LANDING_PAGE
- SITE
- CRM
- ERP
- SOCIAL_MEDIA
- TRAFEGO_PAGO
- AUTOMACAO
- SEO
- DESIGN
- COPY
- CONSULTORIA
- OUTRO

### Tipos cobrança:
- UNICO
- MENSAL
- RECORRENTE
- PERSONALIZADO

### Regras:
- serviço gera projeto
- serviço gera entregas
- serviço gera checklist
- serviço gera comissão
- serviço gera financeiro
- serviço gera métricas

---

## 4. PROJETOS

### Objetivo
Gerenciar execução operacional.

### Campos:
- cliente
- contrato
- serviço
- nome
- descrição
- status
- prioridade
- responsável
- equipe envolvida
- progresso
- SLA
- orçamento previsto
- custo operacional
- lucro estimado
- data início
- prazo final
- checklist
- arquivos

### Status:
- PLANEJAMENTO
- EM_EXECUCAO
- EM_REVISAO
- AGUARDANDO_CLIENTE
- FINALIZADO
- PAUSADO
- CANCELADO

### Regras:
- projeto gera tarefas
- projeto gera entregas
- projeto possui timeline
- projeto possui custo operacional
- projeto possui lucratividade

---

## 5. TAREFAS

### Campos:
- projeto
- entrega
- responsável
- título
- descrição
- prioridade
- prazo
- checklist
- arquivos
- observações

### Status:
- PENDENTE
- EM_ANDAMENTO
- EM_REVISAO
- CONCLUIDA
- ATRASADA
- CANCELADA

### Regras:
- tarefa impacta progresso
- tarefa afeta dashboard operacional

---

## 6. KANBAN COMERCIAL

### Objetivo
Cada card representa oportunidade.

### Campos:
- lead
- fase
- valor potencial
- responsável
- probabilidade
- próxima ação
- prioridade
- temperatura

### Regras:
- mover card altera fase
- histórico automático
- alertas de atraso
- drag and drop

---

## 7. CONTRATOS

### Campos:
- cliente
- serviço
- projeto
- título
- descrição
- valor mensal
- valor total
- duração
- data início
- data término
- vencimento
- renovação automática
- forma pagamento
- arquivo PDF
- observações

### Status:
- RASCUNHO
- ATIVO
- PAUSADO
- CANCELADO
- ENCERRADO
- VENCIDO

### Regras:
- contrato gera financeiro
- contrato gera comissão
- contrato gera entregas

---

## 8. PIPELINE OPERACIONAL

### Objetivo
Separar pipeline comercial do operacional.

### Etapas:
- briefing
- planejamento
- produção
- revisão
- aprovação
- entrega
- pós-entrega

### Regras:
- SLA por etapa
- responsáveis
- checklist
- alertas

---

## 9. ENTREGAS

### Campos:
- projeto
- cliente
- contrato
- serviço
- responsável
- status
- prioridade
- prazo
- checklist
- arquivos
- aprovação cliente

### Status:
- PENDENTE
- EM_ANDAMENTO
- EM_REVISAO
- APROVADO
- ENTREGUE
- ATRASADO
- CANCELADO

---

## 10. EQUIPE

### Campos:
- nome
- email
- telefone
- cargo
- departamento
- meta individual
- comissão padrão
- permissões
- foto

### Cargos:
- ADMIN
- GESTOR
- SDR
- CLOSER
- DESENVOLVEDOR
- DESIGNER
- SOCIAL_MEDIA
- GESTOR_TRAFEGO
- FINANCEIRO
- SUPORTE

---

## 11. COMISSÕES

### Tipos:
- VENDA
- RENOVACAO
- RECORRENCIA
- BONUS
- MANUAL

### Status:
- PENDENTE
- APROVADA
- PAGA
- CANCELADA

### Regras:
- fechamento gera comissão
- comissão paga vira despesa

---

## 12. FINANCEIRO

### Tipos:
- RECEITA
- DESPESA

### Status:
- PENDENTE
- PAGO
- ATRASADO
- CANCELADO

### Implementar:
- contas pagar
- contas receber
- inadimplência
- saldo
- previsão financeira
- centro custo

### Centros custo:
- operacional
- vendas
- marketing
- desenvolvimento
- administrativo
- ferramentas

---

## 13. FATURAMENTO

### Calcular:
- faturamento bruto
- faturamento líquido
- receita recorrente
- ticket médio
- crescimento mensal
- inadimplência
- previsão faturamento

---

## 14. METAS

### Tipos:
- FATURAMENTO
- VENDAS
- CLIENTES
- REUNIOES
- ENTREGAS
- LUCRO

---

## 15. AGENDA

### Tipos:
- REUNIAO
- FOLLOW_UP
- LIGACAO
- ENTREGA
- COBRANCA
- INTERNO

---

## 16. DASHBOARD PRINCIPAL

### Mostrar:
- faturamento
- receita recorrente
- clientes ativos
- contratos ativos
- entregas atrasadas
- tarefas críticas
- reuniões dia
- metas
- saldo financeiro
- ticket médio

---

## 17. DASHBOARD OPERACIONAL

### Mostrar:
- projetos atrasados
- tarefas críticas
- SLA risco
- equipe sobrecarregada
- backlog operacional
- produtividade
- gargalos

---

## 18. DASHBOARD EXECUTIVO

### Mostrar:
- lucro estimado
- margem operacional
- crescimento
- churn
- receita por serviço
- clientes lucrativos
- projetos deficitários
- performance equipe

---

## 19. PERFORMANCE CLIENTE

### Mostrar:
- ROI
- leads gerados
- CPL
- conversão
- investimento
- vendas geradas
- relatórios

---

## 20. TRACKING DE HORAS

### Controlar horas por:
- projeto
- entrega
- tarefa
- colaborador

### Objetivos:
- produtividade
- custo operacional
- lucratividade

---

## 21. AUDITORIA

### Registrar:
- login
- alterações
- exclusões
- mudanças financeiras
- mudanças contratuais
- mudanças status

---

## 22. SEGURANÇA

### Implementar:
- JWT
- refresh token
- RBAC
- permissões granulares
- auditoria
- soft delete
- controle sessão
- logs

---

## 23. RELACIONAMENTOS

### Toda entidade deve possuir:
- histórico
- timeline
- comentários
- anexos
- atividades
- tags
- auditoria

---

## 24. ENTREGA ESPERADA

Para cada módulo:

1. análise domínio
2. modelagem
3. SQL
4. Flyway
5. Entity
6. DTO Request
7. DTO Response
8. Repository
9. Service
10. Controller
11. Mapper
12. validações
13. endpoints REST
14. filtros
15. paginação
16. regras negócio
17. integrações
18. UX/UI

---

## 25. ORDEM IMPLEMENTAÇÃO

1. Leads
2. Clientes
3. Serviços
4. Projetos
5. Tarefas
6. Contratos
7. Financeiro
8. Pipeline
9. Entregas
10. Equipe
11. Comissão
12. Agenda
13. Metas
14. Dashboard Principal
15. Dashboard Operacional
16. Dashboard Executivo
17. Performance Cliente
18. Auditoria

---

## IMPORTANTE

### Antes de implementar:
- analisar domínio
- identificar gargalos
- identificar automações
- identificar métricas
- identificar riscos
- identificar melhorias UX

### Princípios:
- Não criar apenas CRUDs
- Criar uma plataforma operacional empresarial real
- Priorizar lógica de negócio complexa
- Integrar módulos de forma coesiva
- Garantir performance e escalabilidade
