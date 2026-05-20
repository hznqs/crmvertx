create index if not exists idx_crm_contracts_status_end_date on crm_contracts (status, end_date);
create index if not exists idx_crm_contracts_client_id on crm_contracts (client_id);

create index if not exists idx_crm_finance_entries_type_status_due on crm_finance_entries (type, status, due_date);
create index if not exists idx_crm_finance_entries_due_date on crm_finance_entries (due_date);

create index if not exists idx_crm_events_status_date on crm_events (status, event_date);
create index if not exists idx_crm_events_client_id_date on crm_events (client_id, event_date);

create index if not exists idx_crm_deliveries_status_deadline on crm_deliveries (status, deadline);
create index if not exists idx_crm_deliveries_owner on crm_deliveries (owner);
create index if not exists idx_crm_deliveries_client_id on crm_deliveries (client_id);

create index if not exists idx_crm_team_members_role_name on crm_team_members (role, name);

create index if not exists idx_crm_goals_date on crm_goals (goal_date desc);

create index if not exists idx_crm_client_performance_client_date on crm_client_performance (client_id, metric_date);
create index if not exists idx_crm_client_performance_date on crm_client_performance (metric_date);
