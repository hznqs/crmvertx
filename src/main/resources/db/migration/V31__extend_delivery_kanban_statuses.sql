alter table if exists crm_deliveries
    drop constraint if exists crm_deliveries_status_check;

alter table if exists crm_deliveries
    add constraint crm_deliveries_status_check
    check (status in ('backlog', 'planejamento', 'pendente', 'producao', 'revisao', 'ajustes', 'aprovado'));

update crm_deliveries
set status = 'backlog'
where status = 'pendente';
