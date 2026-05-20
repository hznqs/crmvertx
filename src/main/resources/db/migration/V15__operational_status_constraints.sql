alter table if exists crm_contracts
    drop constraint if exists crm_contracts_status_check;

alter table if exists crm_contracts
    add constraint crm_contracts_status_check
    check (status in ('ativo', 'encerrado', 'pausado', 'cancelado'));

alter table if exists crm_deliveries
    drop constraint if exists crm_deliveries_status_check;

alter table if exists crm_deliveries
    add constraint crm_deliveries_status_check
    check (status in ('pendente', 'producao', 'revisao', 'aprovado'));

alter table if exists crm_events
    drop constraint if exists crm_events_status_check;

alter table if exists crm_events
    add constraint crm_events_status_check
    check (status in ('agendada', 'executada', 'cancelada'));

alter table if exists crm_finance_entries
    drop constraint if exists crm_finance_entries_type_check;

alter table if exists crm_finance_entries
    add constraint crm_finance_entries_type_check
    check (type in ('receita', 'despesa', 'comissao', 'imposto'));

alter table if exists crm_finance_entries
    drop constraint if exists crm_finance_entries_status_check;

alter table if exists crm_finance_entries
    add constraint crm_finance_entries_status_check
    check (status in ('pago', 'pendente', 'vencido'));
