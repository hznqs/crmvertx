create index if not exists idx_crm_events_active_date
    on crm_events (active, event_date);

create index if not exists idx_crm_events_active_client_date
    on crm_events (active, client_id, event_date);
