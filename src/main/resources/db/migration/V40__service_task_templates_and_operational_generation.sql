CREATE TABLE IF NOT EXISTS crm_service_task_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid NOT NULL REFERENCES crm_service_offerings(id) ON DELETE CASCADE,
    title varchar(180) NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    default_priority varchar(20) NOT NULL DEFAULT 'MEDIA',
    estimated_days integer NOT NULL DEFAULT 1,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT crm_service_task_templates_sort_order_check CHECK (sort_order >= 0),
    CONSTRAINT crm_service_task_templates_estimated_days_check CHECK (estimated_days >= 0),
    CONSTRAINT crm_service_task_templates_priority_check CHECK (default_priority IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA'))
);

CREATE INDEX IF NOT EXISTS idx_crm_service_task_templates_service
    ON crm_service_task_templates(service_id, active, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_service_task_templates_active_title
    ON crm_service_task_templates(service_id, lower(title))
    WHERE active = true;

ALTER TABLE crm_tasks
    ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_crm_tasks_project_sort_order
    ON crm_tasks(project_id, sort_order);

INSERT INTO crm_service_task_templates (
    id,
    service_id,
    title,
    description,
    sort_order,
    default_priority,
    estimated_days
)
SELECT gen_random_uuid(), service.id, template.title, template.description, template.sort_order, template.default_priority, template.estimated_days
FROM crm_service_offerings service
CROSS JOIN (VALUES
    ('Briefing e objetivos', 'Validar objetivos, materiais, acessos e criterios de sucesso com o cliente.', 10, 'ALTA', 1),
    ('Planejamento operacional', 'Organizar escopo, prazos, responsaveis e dependencias da entrega.', 20, 'MEDIA', 2),
    ('Producao principal', 'Executar a producao principal do servico contratado.', 30, 'MEDIA', 5),
    ('Revisao de qualidade', 'Revisar entrega, checklist tecnico e aderencia ao briefing.', 40, 'ALTA', 7),
    ('Ajustes finais', 'Aplicar ajustes aprovados e preparar versao final.', 50, 'MEDIA', 9),
    ('Entrega e handoff', 'Entregar artefatos, acessos e orientacoes finais ao cliente.', 60, 'ALTA', 10)
) AS template(title, description, sort_order, default_priority, estimated_days)
WHERE service.active = true
  AND NOT EXISTS (
      SELECT 1
      FROM crm_service_task_templates existing
      WHERE existing.service_id = service.id
        AND existing.active = true
  );
