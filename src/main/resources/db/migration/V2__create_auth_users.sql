create table if not exists app_users (
    id uuid primary key,
    name varchar(160) not null,
    email varchar(180) not null unique,
    password_hash varchar(255) not null,
    role varchar(40) not null default 'ADMIN',
    enabled boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint app_users_role_check check (role in ('ADMIN', 'MANAGER', 'USER'))
);

create index if not exists idx_app_users_email on app_users (email);