alter table if exists app_users
    drop constraint if exists app_users_role_check;

alter table if exists app_users
    add constraint app_users_role_check
    check (role in ('ADMIN', 'GESTOR', 'COMERCIAL', 'OPERACIONAL', 'FINANCEIRO', 'SUPORTE', 'MANAGER', 'USER'));
