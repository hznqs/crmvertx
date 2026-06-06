ALTER TABLE crm_contracts
    ADD COLUMN IF NOT EXISTS cancelled_at date,
    ADD COLUMN IF NOT EXISTS ended_at date,
    ADD COLUMN IF NOT EXISTS cancellation_reason text,
    ADD COLUMN IF NOT EXISTS churn_reason text,
    ADD COLUMN IF NOT EXISTS non_renewal_reason text,
    ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS mrr_lost numeric(14, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS renewed_from_contract_id uuid,
    ADD COLUMN IF NOT EXISTS renewed_to_contract_id uuid;

UPDATE crm_contracts
SET is_recurring = monthly_value > 0
WHERE is_recurring = false;

UPDATE crm_contracts
SET mrr_lost = monthly_value
WHERE status IN ('cancelado', 'nao_renovado')
  AND monthly_value > 0
  AND mrr_lost = 0;

CREATE INDEX IF NOT EXISTS idx_crm_contracts_client_status_active
    ON crm_contracts (client_id, status, active);

CREATE INDEX IF NOT EXISTS idx_crm_contracts_churn_period
    ON crm_contracts (is_recurring, status, cancelled_at, ended_at);
