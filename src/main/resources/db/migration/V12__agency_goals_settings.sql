alter table crm_settings
    add column if not exists agency_revenue_goal numeric(14,2) not null default 0,
    add column if not exists agency_new_clients_goal integer not null default 0,
    add column if not exists agency_average_ticket_goal numeric(14,2) not null default 0,
    add column if not exists agency_retention_goal numeric(5,2) not null default 0,
    add column if not exists agency_proposals_goal integer not null default 0,
    add column if not exists agency_meetings_goal integer not null default 0;
