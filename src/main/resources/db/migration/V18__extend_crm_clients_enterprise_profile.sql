alter table if exists crm_clients
    alter column email drop not null,
    alter column phone drop not null;

alter table if exists crm_clients
    add column if not exists document varchar(32),
    add column if not exists document_type varchar(20) not null default 'NAO_INFORMADO',
    add column if not exists segment varchar(100),
    add column if not exists status varchar(30) not null default 'ATIVO',
    add column if not exists priority varchar(30) not null default 'MEDIA',
    add column if not exists tags text,
    add column if not exists address_street varchar(180),
    add column if not exists address_number varchar(40),
    add column if not exists address_complement varchar(120),
    add column if not exists address_district varchar(120),
    add column if not exists address_city varchar(120),
    add column if not exists address_state varchar(2),
    add column if not exists address_zip_code varchar(20),
    add column if not exists active boolean not null default true,
    add column if not exists converted_from_lead_id uuid references crm_leads(id) on delete set null,
    add column if not exists created_by uuid references app_users(id) on delete set null,
    add column if not exists updated_by uuid references app_users(id) on delete set null;

alter table if exists crm_clients
    drop constraint if exists crm_clients_contact_check;

alter table if exists crm_clients
    add constraint crm_clients_contact_check
    check (
        nullif(btrim(email), '') is not null
        or nullif(btrim(phone), '') is not null
    );

alter table if exists crm_clients
    drop constraint if exists crm_clients_document_type_check;

alter table if exists crm_clients
    add constraint crm_clients_document_type_check
    check (document_type in ('CPF', 'CNPJ', 'NAO_INFORMADO'));

alter table if exists crm_clients
    drop constraint if exists crm_clients_status_check;

alter table if exists crm_clients
    add constraint crm_clients_status_check
    check (status in ('ATIVO', 'EM_RISCO', 'INATIVO', 'ENCERRADO'));

alter table if exists crm_clients
    drop constraint if exists crm_clients_priority_check;

alter table if exists crm_clients
    add constraint crm_clients_priority_check
    check (priority in ('BAIXA', 'MEDIA', 'ALTA', 'ESTRATEGICA'));

create unique index if not exists ux_crm_clients_document_active
    on crm_clients (document)
    where document is not null and btrim(document) <> '' and active = true;

create index if not exists idx_crm_clients_status_active on crm_clients (status, active);
create index if not exists idx_crm_clients_priority on crm_clients (priority);
create index if not exists idx_crm_clients_segment on crm_clients (lower(segment));
create index if not exists idx_crm_clients_city_state on crm_clients (lower(address_city), address_state);
create index if not exists idx_crm_clients_converted_lead on crm_clients (converted_from_lead_id);
