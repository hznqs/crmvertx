ALTER TABLE crm_commission_sales ADD COLUMN client_id UUID;
CREATE INDEX idx_commission_sales_client ON crm_commission_sales(client_id);
