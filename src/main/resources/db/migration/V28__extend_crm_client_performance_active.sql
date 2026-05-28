alter table crm_client_performance
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

create index if not exists idx_crm_client_performance_active_date on crm_client_performance (active, metric_date);
