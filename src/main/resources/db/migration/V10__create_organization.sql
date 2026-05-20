create table if not exists organizations (
    id uuid primary key,
    name varchar(180) not null,
    email varchar(180),
    phone varchar(40),
    document varchar(40),
    website varchar(200),
    address varchar(280),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_organizations_name on organizations (name);

insert into organizations (id, name, email, phone, document, website, address)
select '00000000-0000-0000-0000-000000000001'::uuid, company_name, company_email, company_phone, company_document, company_website, company_address
from crm_settings
where not exists (select 1 from organizations)
limit 1;
