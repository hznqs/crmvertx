alter table if exists crm_clients
    drop constraint if exists crm_clients_phase_check;

alter table if exists crm_clients
    add constraint crm_clients_phase_check
    check (phase in ('prospeccao', 'negociacao', 'fechado', 'followup', 'perdido'));

alter table if exists app_users
    drop constraint if exists app_users_role_check;

alter table if exists app_users
    add constraint app_users_role_check
    check (role in ('ADMIN', 'GESTOR', 'COMERCIAL', 'OPERACIONAL', 'FINANCEIRO', 'MANAGER', 'USER'));

alter table if exists audit_logs
    add column if not exists ip_address varchar(80),
    add column if not exists field_name varchar(120),
    add column if not exists old_value text,
    add column if not exists new_value text;

create index if not exists idx_crm_clients_search_name on crm_clients (lower(name));
create index if not exists idx_crm_clients_search_email on crm_clients (lower(email));
create index if not exists idx_crm_contracts_status_end_date on crm_contracts (status, end_date);
create index if not exists idx_crm_events_status_date on crm_events (status, event_date);
create index if not exists idx_crm_finance_entries_type_status_due on crm_finance_entries (type, status, due_date);
create index if not exists idx_crm_finance_entries_recurring on crm_finance_entries (type, status, recurring);
create index if not exists idx_crm_client_performance_date on crm_client_performance (metric_date);
create index if not exists idx_audit_logs_user_created on audit_logs (user_id, created_at desc);
