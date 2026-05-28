alter table crm_deliveries
    add column if not exists project_id uuid references crm_projects(id) on delete set null,
    add column if not exists contract_id uuid references crm_contracts(id) on delete set null,
    add column if not exists service_id uuid references crm_service_offerings(id) on delete set null,
    add column if not exists description text,
    add column if not exists approved_at timestamptz,
    add column if not exists delivered_at timestamptz,
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

create index if not exists idx_crm_deliveries_project on crm_deliveries (project_id);
create index if not exists idx_crm_deliveries_contract on crm_deliveries (contract_id);
create index if not exists idx_crm_deliveries_service on crm_deliveries (service_id);
create index if not exists idx_crm_deliveries_active_deadline on crm_deliveries (active, deadline);
