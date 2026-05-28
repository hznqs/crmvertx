create table if not exists crm_lead_stage_history (
    id uuid primary key,
    lead_id uuid not null references crm_leads(id) on delete cascade,
    from_stage varchar(30),
    to_stage varchar(30) not null,
    from_status varchar(30),
    to_status varchar(30) not null,
    reason varchar(240),
    changed_by uuid references app_users(id) on delete set null,
    created_at timestamptz not null default now()
);

create index if not exists idx_crm_lead_stage_history_lead_created on crm_lead_stage_history (lead_id, created_at desc);
create index if not exists idx_crm_lead_stage_history_changed_by on crm_lead_stage_history (changed_by);
