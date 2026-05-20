create table if not exists login_attempts (
    id uuid primary key,
    attempt_key varchar(320) not null unique,
    count integer not null,
    expires_at timestamptz not null,
    updated_at timestamptz not null
);

create index if not exists idx_login_attempts_expires_at on login_attempts (expires_at);
