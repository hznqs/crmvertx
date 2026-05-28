package br.com.vertxmidia.crm.modules.leads.application;

import br.com.vertxmidia.crm.modules.leads.domain.Lead;
import br.com.vertxmidia.crm.modules.leads.dto.LeadFilterRequest;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class LeadSpecifications {

    private LeadSpecifications() {
    }

    public static Specification<Lead> byFilters(LeadFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.search() != null && !filter.search().isBlank()) {
                String search = "%" + filter.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), search),
                        cb.like(cb.lower(root.get("companyName")), search),
                        cb.like(cb.lower(root.get("email")), search),
                        cb.like(cb.lower(root.get("phone")), search)
                ));
            }

            if (filter.origin() != null) {
                predicates.add(cb.equal(root.get("origin"), filter.origin()));
            }
            if (filter.segment() != null && !filter.segment().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("segment")), filter.segment().trim().toLowerCase()));
            }
            if (filter.temperature() != null) {
                predicates.add(cb.equal(root.get("temperature"), filter.temperature()));
            }
            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (filter.commercialStage() != null) {
                predicates.add(cb.equal(root.get("commercialStage"), filter.commercialStage()));
            }
            if (filter.responsibleUserId() != null) {
                predicates.add(cb.equal(root.get("responsibleUserId"), filter.responsibleUserId()));
            }
            if (filter.minPotentialValue() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("potentialValue"), filter.minPotentialValue()));
            }
            if (filter.maxPotentialValue() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("potentialValue"), filter.maxPotentialValue()));
            }
            if (filter.createdFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.createdFrom()));
            }
            if (filter.createdTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.createdTo()));
            }
            if (filter.active() != null) {
                predicates.add(cb.equal(root.get("active"), filter.active()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
