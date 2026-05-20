alter table if exists crm_settings
    add column if not exists company_document varchar(40),
    add column if not exists company_website varchar(200),
    add column if not exists company_address varchar(280),
    add column if not exists default_currency varchar(8) not null default 'BRL',
    add column if not exists default_timezone varchar(80) not null default 'America/Sao_Paulo',
    add column if not exists default_tax_rate numeric(5, 2) not null default 0,
    add column if not exists default_commission_rate numeric(5, 2) not null default 0,
    add column if not exists crm_rules text;
