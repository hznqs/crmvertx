create table if not exists crm_commission_sales (
    id uuid primary key,
    member_id uuid not null references crm_team_members(id) on delete cascade,
    client varchar(180),
    sale_value numeric(14, 2) not null default 0,
    commission_percent numeric(5, 2) not null default 0,
    goal integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint crm_commission_sales_value_check check (sale_value >= 0),
    constraint crm_commission_sales_percent_check check (commission_percent >= 0),
    constraint crm_commission_sales_goal_check check (goal >= 0)
);

create index if not exists idx_crm_commission_sales_member on crm_commission_sales (member_id);
create index if not exists idx_crm_commission_sales_created on crm_commission_sales (created_at desc);
