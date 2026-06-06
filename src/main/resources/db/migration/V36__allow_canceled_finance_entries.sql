alter table if exists crm_finance_entries
    drop constraint if exists crm_finance_entries_status_check;

alter table if exists crm_finance_entries
    add constraint crm_finance_entries_status_check
    check (status in ('pago', 'pendente', 'vencido', 'cancelado'));
