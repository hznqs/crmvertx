create table if not exists crm_projects (
    id uuid primary key,
    client_id uuid not null references crm_clients(id) on delete restrict,
    contract_id uuid references crm_contracts(id) on delete set null,
    service_id uuid references crm_service_offerings(id) on delete set null,
    name varchar(180) not null,
    description text,
    status varchar(40) not null,
    responsible_user_id uuid references app_users(id) on delete set null,
    team_member_ids text,
    progress integer not null default 0,
    sla_due_date date,
    budget numeric(14, 2) not null default 0,
    estimated_cost numeric(14, 2) not null default 0,
    actual_cost numeric(14, 2) not null default 0,
    active boolean not null default true,
    created_by uuid references app_users(id) on delete set null,
    updated_by uuid references app_users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint crm_projects_status_check check (
        status in (
            'PLANEJAMENTO',
            'EM_EXECUCAO',
            'EM_REVISAO',
            'AGUARDANDO_CLIENTE',
            'FINALIZADO',
            'PAUSADO',
            'CANCELADO'
        )
    ),
    constraint crm_projects_progress_check check (progress >= 0 and progress <= 100),
    constraint crm_projects_budget_check check (budget >= 0),
    constraint crm_projects_estimated_cost_check check (estimated_cost >= 0),
    constraint crm_projects_actual_cost_check check (actual_cost >= 0),
    constraint crm_projects_cost_budget_check check (
        budget = 0
        or estimated_cost <= budget * 5
    )
);

create index if not exists idx_crm_projects_client on crm_projects (client_id);
create index if not exists idx_crm_projects_contract on crm_projects (contract_id);
create index if not exists idx_crm_projects_service on crm_projects (service_id);
create index if not exists idx_crm_projects_status on crm_projects (status);
create index if not exists idx_crm_projects_responsible on crm_projects (responsible_user_id);
create index if not exists idx_crm_projects_active_sla on crm_projects (active, sla_due_date);
create index if not exists idx_crm_projects_name_search on crm_projects (lower(name));
