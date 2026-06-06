package br.com.vertxmidia.crm.modules.projects.infrastructure;

import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {

    Optional<Project> findByIdAndActiveTrue(UUID id);

    Optional<Project> findFirstByContractIdAndActiveTrue(UUID contractId);

    long countByStatusAndActiveTrue(ProjectStatus status);

    long countByStatusAndUpdatedAtBetweenAndActiveTrue(ProjectStatus status, java.time.Instant start, java.time.Instant end);

    long countBySlaDueDateLessThanEqualAndStatusNotInAndActiveTrue(LocalDate slaDueDate, Collection<ProjectStatus> statuses);

    @org.springframework.data.jpa.repository.Query("select new br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString(cast(p.status as string), count(p)) from Project p where p.active = true and p.createdAt >= :start and p.createdAt <= :end group by p.status")
    java.util.List<br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString> countByStatusBetween(java.time.Instant start, java.time.Instant end);
}
