create index if not exists idx_crm_finance_entries_active_type_status_due_partial
    on crm_finance_entries (type, status, due_date)
    where active = true;

create index if not exists idx_crm_finance_entries_active_recurring_type_status_partial
    on crm_finance_entries (type, status, recurring)
    where active = true;

create index if not exists idx_crm_contracts_active_status_end_date_partial
    on crm_contracts (status, end_date)
    where active = true;

create index if not exists idx_crm_tasks_active_status_due_partial
    on crm_tasks (status, due_date)
    where active = true;

create index if not exists idx_crm_projects_active_status_sla_partial
    on crm_projects (status, sla_due_date)
    where active = true;

create index if not exists idx_crm_deliveries_active_status_deadline_partial
    on crm_deliveries (status, deadline)
    where active = true;
