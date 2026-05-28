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

    long countBySlaDueDateLessThanEqualAndStatusNotInAndActiveTrue(LocalDate slaDueDate, Collection<ProjectStatus> statuses);
}
