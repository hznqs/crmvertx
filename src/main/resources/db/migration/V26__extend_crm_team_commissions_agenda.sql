alter table crm_team_members
    add column if not exists user_id uuid references app_users(id) on delete set null,
    add column if not exists email varchar(180),
    add column if not exists phone varchar(40),
    add column if not exists hourly_cost numeric(14, 2) not null default 0,
    add column if not exists capacity_hours_month integer not null default 160,
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

alter table crm_commission_sales
    add column if not exists type varchar(40) not null default 'VENDA',
    add column if not exists status varchar(40) not null default 'PENDENTE',
    add column if not exists contract_id uuid references crm_contracts(id) on delete set null,
    add column if not exists finance_entry_id uuid references crm_finance_entries(id) on delete set null,
    add column if not exists paid_at timestamptz,
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

alter table crm_events
    add column if not exists type varchar(40) not null default 'REUNIAO',
    add column if not exists notes text,
    add column if not exists active boolean not null default true,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

create index if not exists idx_crm_team_members_user on crm_team_members (user_id);
create index if not exists idx_crm_team_members_active_role on crm_team_members (active, role);
create index if not exists idx_crm_commission_sales_status on crm_commission_sales (status);
create index if not exists idx_crm_commission_sales_type on crm_commission_sales (type);
create index if not exists idx_crm_commission_sales_contract on crm_commission_sales (contract_id);
create index if not exists idx_crm_commission_sales_active_created on crm_commission_sales (active, created_at desc);
create index if not exists idx_crm_events_type on crm_events (type);
create index if not exists idx_crm_events_active_date on crm_events (active, event_date);
