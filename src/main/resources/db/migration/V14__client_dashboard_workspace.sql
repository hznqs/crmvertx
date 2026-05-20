create table if not exists crm_client_dashboards (
    id uuid primary key,
    client_id uuid not null unique references crm_clients(id) on delete cascade,
    services text,
    next_steps text,
    contact_history text,
    files text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_crm_client_dashboards_client_id
    on crm_client_dashboards (client_id);

create index if not exists idx_crm_client_dashboards_updated_at
    on crm_client_dashboards (updated_at desc);
