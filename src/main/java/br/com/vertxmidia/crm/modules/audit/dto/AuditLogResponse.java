package br.com.vertxmidia.crm.modules.audit.dto;

import br.com.vertxmidia.crm.modules.audit.domain.AuditLog;
import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID userId,
        String action,
        String entity,
        UUID entityId,
        String fieldName,
        String oldValue,
        String newValue,
        String ipAddress,
        String metadata,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getUserId(),
                log.getAction(),
                log.getEntity(),
                log.getEntityId(),
                log.getFieldName(),
                log.getOldValue(),
                log.getNewValue(),
                log.getIpAddress(),
                log.getMetadata(),
                log.getCreatedAt()
        );
    }
}
