package br.com.vertxmidia.crm.modules.audit.application;

import br.com.vertxmidia.crm.modules.audit.domain.AuditLog;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class AuditLogSpecifications {

    private AuditLogSpecifications() {
    }

    public static Specification<AuditLog> userId(UUID userId) {
        return (root, query, cb) -> userId == null ? cb.conjunction() : cb.equal(root.get("userId"), userId);
    }

    public static Specification<AuditLog> action(String action) {
        return (root, query, cb) -> action == null || action.isBlank()
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("action")), action.trim().toLowerCase());
    }

    public static Specification<AuditLog> entity(String entity) {
        return (root, query, cb) -> entity == null || entity.isBlank()
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("entity")), entity.trim().toLowerCase());
    }

    public static Specification<AuditLog> from(Instant from) {
        return (root, query, cb) -> from == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<AuditLog> to(Instant to) {
        return (root, query, cb) -> to == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("createdAt"), to);
    }
}
