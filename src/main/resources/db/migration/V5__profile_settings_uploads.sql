alter table if exists app_users
    add column if not exists position varchar(120),
    add column if not exists photo_url text;

create table if not exists crm_settings (
    id uuid primary key,
    company_name varchar(180) not null,
    company_email varchar(180),
    company_phone varchar(40),
    default_revenue_goal numeric(14, 2) not null default 0,
    default_profit_margin numeric(5, 2) not null default 0,
    preferences text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists uploaded_documents (
    id uuid primary key,
    original_filename varchar(240) not null,
    storage_bucket varchar(120) not null,
    storage_path text not null,
    public_url text,
    content_type varchar(160),
    size_bytes bigint not null default 0,
    uploaded_by uuid references app_users(id) on delete set null,
    created_at timestamptz not null default now()
);

create index if not exists idx_uploaded_documents_created on uploaded_documents (created_at desc);
create index if not exists idx_uploaded_documents_uploaded_by on uploaded_documents (uploaded_by);
