create table if not exists crm_tasks (
    id uuid primary key,
    project_id uuid not null references crm_projects(id) on delete cascade,
    delivery_id uuid references crm_deliveries(id) on delete set null,
    responsible_user_id uuid references app_users(id) on delete set null,
    title varchar(180) not null,
    description text,
    priority varchar(20) not null,
    due_date date not null,
    status varchar(30) not null,
    active boolean not null default true,
    created_by uuid references app_users(id) on delete set null,
    updated_by uuid references app_users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint crm_tasks_priority_check check (priority in ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
    constraint crm_tasks_status_check check (
        status in ('PENDENTE', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDA', 'ATRASADA', 'CANCELADA')
    )
);

create index if not exists idx_crm_tasks_project on crm_tasks (project_id);
create index if not exists idx_crm_tasks_delivery on crm_tasks (delivery_id);
create index if not exists idx_crm_tasks_responsible on crm_tasks (responsible_user_id);
create index if not exists idx_crm_tasks_status_due on crm_tasks (status, due_date);
create index if not exists idx_crm_tasks_active_due on crm_tasks (active, due_date);
create index if not exists idx_crm_tasks_title_search on crm_tasks (lower(title));
