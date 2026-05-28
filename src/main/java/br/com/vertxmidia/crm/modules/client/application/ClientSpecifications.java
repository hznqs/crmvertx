package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.dto.ClientFilterRequest;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

final class ClientSpecifications {

    private ClientSpecifications() {
    }

    static Specification<Client> byFilters(String search, String phase) {
        return Specification.where(hasPhase(phase)).and(matchesSearch(search));
    }

    static Specification<Client> byFilters(ClientFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.search() != null && !filter.search().isBlank()) {
                String like = "%" + filter.search().trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("contactName")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("document")), like)
                ));
            }
            if (filter.phase() != null && !filter.phase().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("phase"), ClientPhase.from(filter.phase())));
            }
            if (filter.document() != null && !filter.document().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("document"), onlyDigits(filter.document())));
            }
            if (filter.documentType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("documentType"), filter.documentType()));
            }
            if (filter.segment() != null && !filter.segment().isBlank()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("segment")), filter.segment().trim().toLowerCase()));
            }
            if (filter.status() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filter.status()));
            }
            if (filter.priority() != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), filter.priority()));
            }
            if (filter.city() != null && !filter.city().isBlank()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("addressCity")), filter.city().trim().toLowerCase()));
            }
            if (filter.state() != null && !filter.state().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("addressState"), filter.state().trim().toUpperCase()));
            }
            if (filter.tag() != null && !filter.tag().isBlank()) {
                String tagLike = "%" + filter.tag().trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("tags")), tagLike));
            }
            if (filter.active() != null) {
                predicates.add(criteriaBuilder.equal(root.get("active"), filter.active()));
            }
            if (filter.createdFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), filter.createdFrom()));
            }
            if (filter.createdTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), filter.createdTo()));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Specification<Client> hasPhase(String phase) {
        return (root, query, criteriaBuilder) -> {
            if (phase == null || phase.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("phase"), ClientPhase.from(phase));
        };
    }

    private static Specification<Client> matchesSearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            String like = "%" + search.trim().toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("contactName")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), like),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), like)
            );
        };
    }

    private static String onlyDigits(String value) {
        return value.replaceAll("\\D", "");
    }
}
