alter table crm_finance_entries
    add column if not exists client_id uuid references crm_clients(id) on delete set null,
    add column if not exists contract_id uuid references crm_contracts(id) on delete set null,
    add column if not exists project_id uuid references crm_projects(id) on delete set null,
    add column if not exists service_id uuid references crm_service_offerings(id) on delete set null,
    add column if not exists cost_center varchar(40) not null default 'operacional',
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

alter table crm_finance_entries
    add constraint crm_finance_entries_cost_center_check check (
        cost_center in ('operacional', 'vendas', 'marketing', 'desenvolvimento', 'administrativo', 'ferramentas')
    );

create index if not exists idx_crm_finance_entries_client on crm_finance_entries (client_id);
create index if not exists idx_crm_finance_entries_contract on crm_finance_entries (contract_id);
create index if not exists idx_crm_finance_entries_project on crm_finance_entries (project_id);
create index if not exists idx_crm_finance_entries_service on crm_finance_entries (service_id);
create index if not exists idx_crm_finance_entries_cost_center on crm_finance_entries (cost_center);
create index if not exists idx_crm_finance_entries_active_due on crm_finance_entries (active, due_date);
