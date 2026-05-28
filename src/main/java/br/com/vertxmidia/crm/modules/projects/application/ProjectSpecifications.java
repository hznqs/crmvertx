package br.com.vertxmidia.crm.modules.projects.application;

import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectFilterRequest;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class ProjectSpecifications {

    private ProjectSpecifications() {
    }

    public static Specification<Project> byFilters(ProjectFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.search() != null && !filter.search().isBlank()) {
                String search = "%" + filter.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), search),
                        cb.like(cb.lower(root.get("description")), search)
                ));
            }
            if (filter.clientId() != null) {
                predicates.add(cb.equal(root.get("clientId"), filter.clientId()));
            }
            if (filter.contractId() != null) {
                predicates.add(cb.equal(root.get("contractId"), filter.contractId()));
            }
            if (filter.serviceId() != null) {
                predicates.add(cb.equal(root.get("serviceId"), filter.serviceId()));
            }
            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (filter.responsibleUserId() != null) {
                predicates.add(cb.equal(root.get("responsibleUserId"), filter.responsibleUserId()));
            }
            if (filter.slaFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("slaDueDate"), filter.slaFrom()));
            }
            if (filter.slaTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("slaDueDate"), filter.slaTo()));
            }
            if (filter.active() != null) {
                predicates.add(cb.equal(root.get("active"), filter.active()));
            }
            if (filter.createdFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.createdFrom()));
            }
            if (filter.createdTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.createdTo()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
