ALTER TABLE crm_leads
    ADD COLUMN IF NOT EXISTS service_interest varchar(180),
    ADD COLUMN IF NOT EXISTS next_action varchar(240),
    ADD COLUMN IF NOT EXISTS next_action_date date,
    ADD COLUMN IF NOT EXISTS responsible_name varchar(160);

CREATE INDEX IF NOT EXISTS idx_crm_leads_next_action_date
    ON crm_leads(active, next_action_date);

ALTER TABLE crm_clients
    ADD COLUMN IF NOT EXISTS client_type varchar(20) NOT NULL DEFAULT 'JURIDICA',
    ADD COLUMN IF NOT EXISTS origin varchar(80),
    ADD COLUMN IF NOT EXISTS responsible_name varchar(160);

CREATE INDEX IF NOT EXISTS idx_crm_clients_origin
    ON crm_clients(origin);

ALTER TABLE crm_service_offerings
    ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE crm_contracts
    ADD COLUMN IF NOT EXISTS seller_name varchar(160),
    ADD COLUMN IF NOT EXISTS payment_method varchar(80),
    ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE crm_projects
    ADD COLUMN IF NOT EXISTS start_date date,
    ADD COLUMN IF NOT EXISTS priority varchar(30) NOT NULL DEFAULT 'MEDIA';

CREATE INDEX IF NOT EXISTS idx_crm_projects_priority
    ON crm_projects(priority);

ALTER TABLE crm_tasks
    ADD COLUMN IF NOT EXISTS client_id uuid,
    ADD COLUMN IF NOT EXISTS contract_id uuid,
    ADD COLUMN IF NOT EXISTS service_id uuid,
    ADD COLUMN IF NOT EXISTS checklist text,
    ADD COLUMN IF NOT EXISTS comments text,
    ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_crm_tasks_client
    ON crm_tasks(client_id);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_contract
    ON crm_tasks(contract_id);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_service
    ON crm_tasks(service_id);

ALTER TABLE crm_deliveries
    ADD COLUMN IF NOT EXISTS priority varchar(30) NOT NULL DEFAULT 'MEDIA',
    ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tags text;

ALTER TABLE crm_events
    ADD COLUMN IF NOT EXISTS lead_id uuid,
    ADD COLUMN IF NOT EXISTS project_id uuid;

CREATE INDEX IF NOT EXISTS idx_crm_events_lead
    ON crm_events(lead_id);

CREATE INDEX IF NOT EXISTS idx_crm_events_project
    ON crm_events(project_id);

ALTER TABLE crm_finance_entries
    ADD COLUMN IF NOT EXISTS payment_method varchar(80),
    ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE crm_commission_sales
    ADD COLUMN IF NOT EXISTS calculation_type varchar(20) NOT NULL DEFAULT 'PERCENTUAL',
    ADD COLUMN IF NOT EXISTS fixed_value numeric(14, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reference_month date;

ALTER TABLE crm_goals
    ADD COLUMN IF NOT EXISTS name varchar(160),
    ADD COLUMN IF NOT EXISTS responsible varchar(160),
    ADD COLUMN IF NOT EXISTS status varchar(30) NOT NULL DEFAULT 'EM_ANDAMENTO';

CREATE INDEX IF NOT EXISTS idx_crm_goals_status
    ON crm_goals(status);

ALTER TABLE crm_team_members
    ADD COLUMN IF NOT EXISTS function_name varchar(120),
    ADD COLUMN IF NOT EXISTS joined_at date;
