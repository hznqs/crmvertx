create table if not exists audit_logs (
    id uuid primary key,
    user_id uuid references app_users(id) on delete set null,
    action varchar(80) not null,
    entity varchar(80) not null,
    entity_id uuid,
    metadata text,
    created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on audit_logs (created_at desc);

create table if not exists crm_contracts (
    id uuid primary key,
    client_id uuid references crm_clients(id) on delete set null,
    plan varchar(120) not null,
    start_date date not null,
    end_date date not null,
    status varchar(40) not null,
    auto_renew boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists crm_deliveries (
    id uuid primary key,
    client_id uuid references crm_clients(id) on delete set null,
    type varchar(80) not null,
    title varchar(180) not null,
    owner varchar(160) not null,
    deadline date not null,
    status varchar(40) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists crm_events (
    id uuid primary key,
    client_id uuid references crm_clients(id) on delete set null,
    title varchar(180) not null,
    event_date date not null,
    event_time time,
    status varchar(40) not null,
    sale boolean not null default false,
    revenue numeric(14, 2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists crm_finance_entries (
    id uuid primary key,
    type varchar(40) not null,
    status varchar(40) not null,
    description varchar(220) not null,
    value numeric(14, 2) not null default 0,
    due_date date not null,
    recurring boolean not null default false,
    auto_billing boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists crm_client_performance (
    id uuid primary key,
    client_id uuid references crm_clients(id) on delete cascade,
    metric_date date not null,
    leads integer not null default 0,
    sales integer not null default 0,
    revenue numeric(14, 2) not null default 0,
    investment numeric(14, 2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists crm_goals (
    id uuid primary key,
    target numeric(14, 2) not null default 0,
    goal_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists crm_team_members (
    id uuid primary key,
    name varchar(160) not null,
    role varchar(80) not null,
    tasks integer not null default 0,
    completed integer not null default 0,
    performance integer not null default 0,
    notes text,
    task_breakdown text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_crm_contracts_client on crm_contracts (client_id);
create index if not exists idx_crm_contracts_status on crm_contracts (status);
create index if not exists idx_crm_deliveries_status_deadline on crm_deliveries (status, deadline);
create index if not exists idx_crm_events_date on crm_events (event_date);
create index if not exists idx_crm_finance_entries_due on crm_finance_entries (due_date);
create index if not exists idx_crm_client_performance_client on crm_client_performance (client_id);
create index if not exists idx_crm_goals_date on crm_goals (goal_date desc);
create index if not exists idx_crm_team_members_role on crm_team_members (role);