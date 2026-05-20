create table if not exists crm_clients (
    id uuid primary key,
    name varchar(160) not null,
    phase varchar(40) not null,
    contract_value numeric(14, 2) not null default 0,
    contract_months integer not null default 1,
    contact_name varchar(160) not null,
    email varchar(180) not null,
    phone varchar(40) not null,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint crm_clients_phase_check check (phase in ('prospeccao', 'negociacao', 'fechado', 'followup')),
    constraint crm_clients_contract_months_check check (contract_months > 0),
    constraint crm_clients_contract_value_check check (contract_value >= 0)
);

create index if not exists idx_crm_clients_phase on crm_clients (phase);
create index if not exists idx_crm_clients_created_at on crm_clients (created_at desc);