package br.com.vertxmidia.crm.modules.audit.application;

import br.com.vertxmidia.crm.modules.audit.domain.AuditLog;
import br.com.vertxmidia.crm.modules.audit.infrastructure.AuditLogRepository;
import java.util.Objects;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entity, UUID entityId) {
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId());
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setIpAddress(currentIpAddress());
        repository.save(log);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAuthentication(String action, UUID userId, String email) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setEntity("Authentication");
        log.setMetadata("email=" + sanitizeMetadata(email));
        log.setIpAddress(currentIpAddress());
        repository.save(log);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logChange(String entity, UUID entityId, String fieldName, Object oldValue, Object newValue) {
        if (Objects.equals(normalize(oldValue), normalize(newValue))) {
            return;
        }

        AuditLog log = new AuditLog();
        log.setUserId(currentUserId());
        log.setAction("UPDATE");
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setFieldName(fieldName);
        log.setOldValue(normalize(oldValue));
        log.setNewValue(normalize(newValue));
        log.setIpAddress(currentIpAddress());
        repository.save(log);
    }

    private String normalize(Object value) {
        return value == null ? null : String.valueOf(value);
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
