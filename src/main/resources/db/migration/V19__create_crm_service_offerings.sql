create table if not exists crm_service_offerings (
    id uuid primary key,
    name varchar(160) not null,
    category varchar(40) not null,
    description text,
    billing_type varchar(30) not null,
    base_price numeric(14, 2) not null default 0,
    sla_days integer not null default 0,
    estimated_hours numeric(10, 2) not null default 0,
    default_checklist text,
    delivery_stages text,
    commission_percentage numeric(5, 2) not null default 0,
    gross_margin_percentage numeric(5, 2) not null default 0,
    active boolean not null default true,
    created_by uuid references app_users(id) on delete set null,
    updated_by uuid references app_users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint crm_service_offerings_category_check check (
        category in (
            'LANDING_PAGE',
            'SITE',
            'CRM',
            'ERP',
            'SOCIAL_MEDIA',
            'TRAFEGO_PAGO',
            'AUTOMACAO',
            'SEO',
            'DESIGN',
            'COPY',
            'CONSULTORIA',
            'OUTRO'
        )
    ),
    constraint crm_service_offerings_billing_type_check check (
        billing_type in ('UNICO', 'MENSAL', 'RECORRENTE', 'PERSONALIZADO')
    ),
    constraint crm_service_offerings_base_price_check check (base_price >= 0),
    constraint crm_service_offerings_sla_days_check check (sla_days >= 0 and sla_days <= 3650),
    constraint crm_service_offerings_estimated_hours_check check (estimated_hours >= 0),
    constraint crm_service_offerings_commission_check check (
        commission_percentage >= 0
        and commission_percentage <= 100
    ),
    constraint crm_service_offerings_margin_check check (
        gross_margin_percentage >= 0
        and gross_margin_percentage <= 100
    ),
    constraint crm_service_offerings_commission_margin_check check (
        commission_percentage <= gross_margin_percentage
        or gross_margin_percentage = 0
    ),
    constraint crm_service_offerings_price_policy_check check (
        billing_type = 'PERSONALIZADO'
        or base_price > 0
    )
);

create unique index if not exists uq_crm_service_offerings_active_name
    on crm_service_offerings (lower(name))
    where active = true;

create index if not exists idx_crm_service_offerings_name_search on crm_service_offerings (lower(name));
create index if not exists idx_crm_service_offerings_category on crm_service_offerings (category);
create index if not exists idx_crm_service_offerings_billing_type on crm_service_offerings (billing_type);
create index if not exists idx_crm_service_offerings_active_created on crm_service_offerings (active, created_at desc);
create index if not exists idx_crm_service_offerings_base_price on crm_service_offerings (base_price);
