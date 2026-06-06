ALTER TABLE crm_contracts
    DROP CONSTRAINT IF EXISTS crm_contracts_duration_months_check;

ALTER TABLE crm_contracts
    DROP CONSTRAINT IF EXISTS crm_contracts_discount_not_greater_than_gross_check;

ALTER TABLE crm_contracts
    ADD CONSTRAINT crm_contracts_duration_months_check CHECK (duration_months >= 0 AND duration_months <= 600);
