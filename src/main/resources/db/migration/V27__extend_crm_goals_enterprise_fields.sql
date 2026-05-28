alter table crm_goals
    add column if not exists type varchar(40) not null default 'FATURAMENTO',
    add column if not exists actual numeric(14, 2) not null default 0,
    add column if not exists period_start date,
    add column if not exists period_end date,
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

update crm_goals
set period_start = date_trunc('month', goal_date)::date
where period_start is null;

update crm_goals
set period_end = (date_trunc('month', goal_date)::date + interval '1 month - 1 day')::date
where period_end is null;

alter table crm_goals
    add constraint crm_goals_type_check check (
        type in ('FATURAMENTO', 'VENDAS', 'CLIENTES', 'REUNIOES', 'ENTREGAS', 'LUCRO')
    ),
    add constraint crm_goals_actual_check check (actual >= 0),
    add constraint crm_goals_period_check check (period_end is null or period_start is null or period_end >= period_start);

create index if not exists idx_crm_goals_type_period on crm_goals (type, period_start, period_end);
create index if not exists idx_crm_goals_active_date on crm_goals (active, goal_date desc);
