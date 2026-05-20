package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import org.springframework.data.jpa.domain.Specification;

final class ClientSpecifications {

    private ClientSpecifications() {
    }

    static Specification<Client> byFilters(String search, String phase) {
        return Specification.where(hasPhase(phase)).and(matchesSearch(search));
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
}
