ALTER TABLE crm_events
    ADD COLUMN IF NOT EXISTS contract_id uuid,
    ADD COLUMN IF NOT EXISTS task_id uuid,
    ADD COLUMN IF NOT EXISTS end_date date,
    ADD COLUMN IF NOT EXISTS all_day boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS meeting_url varchar(500),
    ADD COLUMN IF NOT EXISTS priority varchar(20) NOT NULL DEFAULT 'media',
    ADD COLUMN IF NOT EXISTS color varchar(24),
    ADD COLUMN IF NOT EXISTS recurrence_rule varchar(80),
    ADD COLUMN IF NOT EXISTS recurrence_group_id uuid,
    ADD COLUMN IF NOT EXISTS participants text,
    ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

UPDATE crm_events
SET end_date = event_date
WHERE end_date IS NULL;

UPDATE crm_events
SET meeting_url = meeting_link
WHERE meeting_url IS NULL
  AND meeting_link IS NOT NULL;

ALTER TABLE IF EXISTS crm_events
    DROP CONSTRAINT IF EXISTS crm_events_status_check;

ALTER TABLE IF EXISTS crm_events
    ADD CONSTRAINT crm_events_status_check
    CHECK (status IN ('agendada', 'executada', 'realizada', 'cancelada', 'remarcada'));

ALTER TABLE IF EXISTS crm_events
    DROP CONSTRAINT IF EXISTS crm_events_priority_check;

ALTER TABLE IF EXISTS crm_events
    ADD CONSTRAINT crm_events_priority_check
    CHECK (priority IN ('baixa', 'media', 'alta', 'critica'));

CREATE INDEX IF NOT EXISTS idx_crm_events_contract
    ON crm_events(contract_id);

CREATE INDEX IF NOT EXISTS idx_crm_events_task
    ON crm_events(task_id);

CREATE INDEX IF NOT EXISTS idx_crm_events_active_range
    ON crm_events(active, event_date, end_date);

CREATE INDEX IF NOT EXISTS idx_crm_events_responsible_range
    ON crm_events(active, responsible, event_date, event_time, end_time);
