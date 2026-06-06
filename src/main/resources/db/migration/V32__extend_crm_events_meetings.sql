alter table crm_events
    add column if not exists end_time time,
    add column if not exists responsible varchar(180),
    add column if not exists meeting_link varchar(500),
    add column if not exists location varchar(240),
    add column if not exists reminder_minutes_before integer not null default 15;

create index if not exists idx_crm_events_active_type_date on crm_events (active, type, event_date);
create index if not exists idx_crm_events_active_status_date on crm_events (active, status, event_date);
create index if not exists idx_crm_events_responsible on crm_events (responsible);
