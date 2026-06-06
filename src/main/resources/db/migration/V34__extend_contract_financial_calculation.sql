alter table crm_contracts
    add column if not exists implementation_fee numeric(14, 2) not null default 0,
    add column if not exists discount_value numeric(14, 2) not null default 0;

update crm_contracts
set total_value = greatest(0, (monthly_value * duration_months) + implementation_fee - discount_value)
where active = true;

alter table crm_contracts
    drop constraint if exists crm_contracts_implementation_fee_check,
    drop constraint if exists crm_contracts_discount_value_check,
    drop constraint if exists crm_contracts_discount_not_greater_than_gross_check;

alter table crm_contracts
    add constraint crm_contracts_implementation_fee_check check (implementation_fee >= 0),
    add constraint crm_contracts_discount_value_check check (discount_value >= 0),
    add constraint crm_contracts_discount_not_greater_than_gross_check check (discount_value <= ((monthly_value * duration_months) + implementation_fee));
