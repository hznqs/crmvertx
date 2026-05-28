alter table crm_contracts
    add column if not exists service_id uuid references crm_service_offerings(id) on delete set null,
    add column if not exists project_id uuid references crm_projects(id) on delete set null,
    add column if not exists monthly_value numeric(14, 2) not null default 0,
    add column if not exists total_value numeric(14, 2) not null default 0,
    add column if not exists duration_months integer not null default 1,
    add column if not exists billing_due_day integer,
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

update crm_contracts
set duration_months = greatest(1, extract(year from age(end_date, start_date))::int * 12 + extract(month from age(end_date, start_date))::int)
where duration_months = 1
  and end_date >= start_date;

update crm_contracts
set monthly_value = total_value / nullif(duration_months, 0)
where monthly_value = 0
  and total_value > 0;

alter table crm_contracts
    add constraint crm_contracts_monthly_value_check check (monthly_value >= 0),
    add constraint crm_contracts_total_value_check check (total_value >= 0),
    add constraint crm_contracts_duration_months_check check (duration_months > 0 and duration_months <= 600),
    add constraint crm_contracts_billing_due_day_check check (billing_due_day is null or (billing_due_day >= 1 and billing_due_day <= 31));

create index if not exists idx_crm_contracts_service on crm_contracts (service_id);
create index if not exists idx_crm_contracts_project on crm_contracts (project_id);
create index if not exists idx_crm_contracts_active_status on crm_contracts (active, status);
create index if not exists idx_crm_contracts_billing_due_day on crm_contracts (billing_due_day);
