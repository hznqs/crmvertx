UPDATE crm_clients
SET contract_value = 0,
    contract_months = 1
WHERE contract_value <> 0
   OR contract_months <> 1;

ALTER TABLE IF EXISTS crm_clients
    DROP CONSTRAINT IF EXISTS crm_clients_contract_value_zero_check;

ALTER TABLE IF EXISTS crm_clients
    ADD CONSTRAINT crm_clients_contract_value_zero_check
    CHECK (contract_value = 0);

ALTER TABLE IF EXISTS crm_clients
    DROP CONSTRAINT IF EXISTS crm_clients_contract_months_legacy_check;

ALTER TABLE IF EXISTS crm_clients
    ADD CONSTRAINT crm_clients_contract_months_legacy_check
    CHECK (contract_months = 1);
