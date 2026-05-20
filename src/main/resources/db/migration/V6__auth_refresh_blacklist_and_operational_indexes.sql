create table if not exists refresh_tokens (
    id uuid primary key,
    user_id uuid not null references app_users(id) on delete cascade,
    token_hash varchar(128) not null unique,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_user_id on refresh_tokens (user_id);
create index if not exists idx_refresh_tokens_expires_at on refresh_tokens (expires_at);
create index if not exists idx_refresh_tokens_active on refresh_tokens (token_hash) where revoked_at is null;

create table if not exists blacklisted_jwts (
    id uuid primary key,
    jti varchar(120) not null unique,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_blacklisted_jwts_expires_at on blacklisted_jwts (expires_at);

alter table if exists uploaded_documents
    add column if not exists entity_type varchar(80),
    add column if not exists entity_id uuid,
    add column if not exists deleted_at timestamptz;

create index if not exists idx_uploaded_documents_entity on uploaded_documents (entity_type, entity_id);
create index if not exists idx_uploaded_documents_active_created on uploaded_documents (created_at desc) where deleted_at is null;

create index if not exists idx_audit_logs_action on audit_logs (action);
create index if not exists idx_audit_logs_entity on audit_logs (entity);
create index if not exists idx_audit_logs_created_at on audit_logs (created_at desc);
create index if not exists idx_audit_logs_user_id on audit_logs (user_id);
