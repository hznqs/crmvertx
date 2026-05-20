create index if not exists idx_crm_clients_phase_created_at
    on crm_clients (phase, created_at desc);

create index if not exists idx_crm_clients_lower_name
    on crm_clients (lower(name));

create index if not exists idx_crm_clients_lower_contact_name
    on crm_clients (lower(contact_name));

create index if not exists idx_crm_clients_lower_email
    on crm_clients (lower(email));

create index if not exists idx_crm_events_status_date_client
    on crm_events (status, event_date, client_id);

create index if not exists idx_crm_events_sale_date
    on crm_events (sale, event_date);

create index if not exists idx_crm_finance_entries_due_status_type
    on crm_finance_entries (due_date, status, type);

create index if not exists idx_crm_deliveries_lower_owner
    on crm_deliveries (lower(owner));

create index if not exists idx_crm_team_members_lower_name
    on crm_team_members (lower(name));

create index if not exists idx_crm_commission_sales_member_created
    on crm_commission_sales (member_id, created_at desc);

create index if not exists idx_uploaded_documents_lower_filename
    on uploaded_documents (lower(original_filename))
    where deleted_at is null;

create index if not exists idx_audit_logs_lower_action_created
    on audit_logs (lower(action), created_at desc);

create index if not exists idx_audit_logs_lower_entity_created
    on audit_logs (lower(entity), created_at desc);

create index if not exists idx_login_attempts_key_expires
    on login_attempts (attempt_key, expires_at);
