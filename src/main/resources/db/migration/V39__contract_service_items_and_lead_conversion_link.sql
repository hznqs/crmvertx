CREATE TABLE IF NOT EXISTS crm_contract_service_items (
    id uuid PRIMARY KEY,
    contract_id uuid NOT NULL,
    service_id uuid,
    service_name_snapshot varchar(160) NOT NULL,
    service_value_snapshot numeric(14, 2) NOT NULL DEFAULT 0,
    billing_type_snapshot varchar(30) NOT NULL DEFAULT 'MENSAL',
    service_active_snapshot boolean NOT NULL DEFAULT true,
    quantity integer NOT NULL DEFAULT 1,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT crm_contract_service_items_value_check CHECK (service_value_snapshot >= 0),
    CONSTRAINT crm_contract_service_items_quantity_check CHECK (quantity >= 1),
    CONSTRAINT fk_contract_service_items_contract FOREIGN KEY (contract_id) REFERENCES crm_contracts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_crm_contract_service_items_contract
    ON crm_contract_service_items(contract_id)
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_crm_contract_service_items_service
    ON crm_contract_service_items(service_id)
    WHERE active = true;

INSERT INTO crm_contract_service_items (
    id,
    contract_id,
    service_id,
    service_name_snapshot,
    service_value_snapshot,
    billing_type_snapshot,
    service_active_snapshot,
    quantity,
    active,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    c.id,
    c.service_id,
    COALESCE(s.name, c.plan, 'Servico legado'),
    COALESCE(NULLIF(s.base_price, 0), c.monthly_value, 0),
    COALESCE(s.billing_type, 'MENSAL'),
    COALESCE(s.active, true),
    1,
    true,
    COALESCE(c.created_at, now()),
    COALESCE(c.updated_at, now())
FROM crm_contracts c
LEFT JOIN crm_service_offerings s ON s.id = c.service_id
WHERE c.service_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM crm_contract_service_items item
      WHERE item.contract_id = c.id
        AND item.service_id = c.service_id
        AND item.active = true
  );

ALTER TABLE crm_leads
    ADD COLUMN IF NOT EXISTS converted_client_id uuid;

CREATE INDEX IF NOT EXISTS idx_crm_leads_converted_client
    ON crm_leads(converted_client_id)
    WHERE converted_client_id IS NOT NULL;
