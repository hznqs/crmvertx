package br.com.vertxmidia.crm.modules.operations.application;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

final class OperationSpecifications {

    private OperationSpecifications() {
    }

    static <T> Specification<T> textLike(String field, String value) {
        return (root, query, cb) -> {
            if (value == null || value.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get(field)), "%" + value.trim().toLowerCase() + "%");
        };
    }

    static <T> Specification<T> equalsText(String field, String value) {
        return (root, query, cb) -> {
            if (value == null || value.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(root.get(field), value.trim());
        };
    }

    static <T> Specification<T> equalsUuid(String field, UUID value) {
        return (root, query, cb) -> value == null ? cb.conjunction() : cb.equal(root.get(field), value);
    }

    static <T> Specification<T> dateFrom(String field, LocalDate value) {
        return (root, query, cb) -> value == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get(field), value);
    }

    static <T> Specification<T> dateTo(String field, LocalDate value) {
        return (root, query, cb) -> value == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get(field), value);
    }
}
