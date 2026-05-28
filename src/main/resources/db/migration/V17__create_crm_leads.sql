create table if not exists crm_leads (
    id uuid primary key,
    name varchar(160) not null,
    company_name varchar(160),
    email varchar(180),
    phone varchar(40),
    origin varchar(40) not null,
    segment varchar(100),
    temperature varchar(20) not null,
    potential_value numeric(14, 2) not null default 0,
    responsible_user_id uuid references app_users(id) on delete set null,
    notes text,
    status varchar(30) not null,
    commercial_stage varchar(30) not null,
    lost_reason varchar(240),
    converted_at timestamptz,
    active boolean not null default true,
    created_by uuid references app_users(id) on delete set null,
    updated_by uuid references app_users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint crm_leads_origin_check check (
        origin in (
            'SITE',
            'LANDING_PAGE',
            'INSTAGRAM',
            'FACEBOOK',
            'GOOGLE_ADS',
            'INDICACAO',
            'WHATSAPP',
            'PROSPECCAO_ATIVA',
            'EVENTO',
            'OUTRO'
        )
    ),
    constraint crm_leads_temperature_check check (temperature in ('FRIO', 'MORNO', 'QUENTE')),
    constraint crm_leads_status_check check (status in ('ACTIVE', 'INACTIVE', 'CONVERTED', 'LOST')),
    constraint crm_leads_commercial_stage_check check (
        commercial_stage in ('NOVO', 'CONTATO', 'REUNIAO', 'PROPOSTA', 'NEGOCIACAO', 'FECHADO', 'PERDIDO')
    ),
    constraint crm_leads_potential_value_check check (potential_value >= 0),
    constraint crm_leads_contact_check check (
        nullif(btrim(email), '') is not null
        or nullif(btrim(phone), '') is not null
    ),
    constraint crm_leads_lost_reason_check check (
        commercial_stage <> 'PERDIDO'
        or nullif(btrim(lost_reason), '') is not null
    ),
    constraint crm_leads_converted_at_check check (
        status <> 'CONVERTED'
        or converted_at is not null
    )
);

create index if not exists idx_crm_leads_name_search on crm_leads (lower(name));
create index if not exists idx_crm_leads_company_search on crm_leads (lower(company_name));
create index if not exists idx_crm_leads_email_search on crm_leads (lower(email));
create index if not exists idx_crm_leads_phone on crm_leads (phone);
create index if not exists idx_crm_leads_origin on crm_leads (origin);
create index if not exists idx_crm_leads_temperature on crm_leads (temperature);
create index if not exists idx_crm_leads_status_stage on crm_leads (status, commercial_stage);
create index if not exists idx_crm_leads_responsible on crm_leads (responsible_user_id);
create index if not exists idx_crm_leads_active_created on crm_leads (active, created_at desc);
create index if not exists idx_crm_leads_potential_value on crm_leads (potential_value desc);
