package br.com.vertxmidia.crm.modules.audit.application;

import br.com.vertxmidia.crm.common.realtime.RealtimeEvent;
import br.com.vertxmidia.crm.common.realtime.RealtimeEventHub;
import br.com.vertxmidia.crm.modules.audit.domain.AuditLog;
import br.com.vertxmidia.crm.modules.audit.infrastructure.AuditLogRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository repository;
    private final RealtimeEventHub eventHub;

    public AuditService(AuditLogRepository repository, RealtimeEventHub eventHub) {
        this.repository = repository;
        this.eventHub = eventHub;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entity, UUID entityId) {
        try {
            AuditLog log = new AuditLog();
            log.setUserId(currentUserId());
            log.setAction(action);
            log.setEntity(entity);
            log.setEntityId(entityId);
            log.setIpAddress(currentIpAddress());
            publish(repository.save(log));
        } catch (RuntimeException exception) {
            LOGGER.warn("Falha ao registrar auditoria {} para {} {}. Operacao principal preservada. Motivo: {}",
                    action, entity, entityId, exception.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAuthentication(String action, UUID userId, String email) {
        try {
            AuditLog log = new AuditLog();
            log.setUserId(userId);
            log.setAction(action);
            log.setEntity("Authentication");
            log.setMetadata("email=" + sanitizeMetadata(email));
            log.setIpAddress(currentIpAddress());
            publish(repository.save(log));
        } catch (RuntimeException exception) {
            LOGGER.warn("Falha ao registrar auditoria de autenticacao {}. Operacao principal preservada. Motivo: {}",
                    action, exception.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logChange(String entity, UUID entityId, String fieldName, Object oldValue, Object newValue) {
        if (Objects.equals(normalize(oldValue), normalize(newValue))) {
            return;
        }

        try {
            AuditLog log = new AuditLog();
            log.setUserId(currentUserId());
            log.setAction("UPDATE");
            log.setEntity(entity);
            log.setEntityId(entityId);
            log.setFieldName(fieldName);
            log.setOldValue(normalize(oldValue));
            log.setNewValue(normalize(newValue));
            log.setIpAddress(currentIpAddress());
            publish(repository.save(log));
        } catch (RuntimeException exception) {
            LOGGER.warn("Falha ao registrar auditoria de alteracao {}.{} para {}. Operacao principal preservada. Motivo: {}",
                    entity, fieldName, entityId, exception.getMessage());
        }
    }

    private String normalize(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private void publish(AuditLog log) {
        if (log == null) {
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("auditId", log.getId() == null ? "" : log.getId().toString());
        payload.put("entity", log.getEntity());
        payload.put("action", log.getAction());
        payload.put("fieldName", log.getFieldName() == null ? "" : log.getFieldName());
        payload.put("oldValue", log.getOldValue() == null ? "" : log.getOldValue());
        payload.put("newValue", log.getNewValue() == null ? "" : log.getNewValue());
        payload.put("metadata", log.getMetadata() == null ? "" : log.getMetadata());
        payload.put("createdAt", log.getCreatedAt() == null ? Instant.now().toString() : log.getCreatedAt().toString());

        eventHub.publish(RealtimeEvent.of(
                eventType(log),
                "activity",
                log.getUserId(),
                log.getEntity(),
                log.getEntityId(),
                log.getAction(),
                payload
        ));
    }

    private String eventType(AuditLog log) {
        if ("Authentication".equals(log.getEntity())) {
            return "auth." + log.getAction().toLowerCase().replace('_', '.');
        }
        return "activity." + log.getAction().toLowerCase();
    }

    private String sanitizeMetadata(String value) {
        return String.valueOf(value == null ? "" : value)
                .replace("\r", "")
                .replace("\n", "")
                .trim();
    }

    private UUID currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return null;
        }

        try {
            return UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String currentIpAddress() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return null;
        }

        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
