UPDATE crm_leads
SET active = false,
    updated_at = now()
WHERE active = true
  AND (
      status = 'CONVERTED'
      OR converted_client_id IS NOT NULL
      OR converted_at IS NOT NULL
  );
