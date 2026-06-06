package br.com.vertxmidia.crm.modules.tasks.infrastructure;

import br.com.vertxmidia.crm.modules.tasks.domain.Task;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    Optional<Task> findByIdAndActiveTrue(UUID id);

    List<Task> findByProjectIdAndActiveTrue(UUID projectId);

    long countByProjectIdAndStatusAndActiveTrue(UUID projectId, TaskStatus status);

    long countByDueDateBeforeAndStatusNotInAndActiveTrue(LocalDate date, Collection<TaskStatus> statuses);

    long countByStatusNotInAndActiveTrue(Collection<TaskStatus> statuses);

    long countByStatusAndUpdatedAtBetweenAndActiveTrue(TaskStatus status, java.time.Instant start, java.time.Instant end);
}
