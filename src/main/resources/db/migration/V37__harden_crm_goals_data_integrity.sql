update crm_goals
set type = 'FATURAMENTO'
where type is null or btrim(type) = '';

update crm_goals
set target = 0
where target is null or target < 0;

update crm_goals
set actual = 0
where actual is null or actual < 0;

update crm_goals
set period_start = date_trunc('month', goal_date)::date
where period_start is null;

update crm_goals
set period_end = (date_trunc('month', goal_date)::date + interval '1 month - 1 day')::date
where period_end is null;

update crm_goals
set period_end = period_start
where period_start is not null
  and period_end is not null
  and period_end < period_start;

alter table if exists crm_goals
    drop constraint if exists crm_goals_type_check;

alter table if exists crm_goals
    add constraint crm_goals_type_check check (
        type in (
            'FATURAMENTO',
            'VENDAS',
            'CLIENTES',
            'REUNIOES',
            'ENTREGAS',
            'LUCRO',
            'LEADS',
            'TAREFAS',
            'PROJETOS',
            'COMISSAO'
        )
    );
