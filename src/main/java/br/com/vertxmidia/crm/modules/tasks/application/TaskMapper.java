package br.com.vertxmidia.crm.modules.tasks.application;

import br.com.vertxmidia.crm.modules.tasks.domain.Task;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskRequest;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskResponse;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task toEntity(TaskRequest request) {
        Task task = new Task();
        updateEntity(request, task);
        task.setActive(request.active() == null || request.active());
        return task;
    }

    public void updateEntity(TaskRequest request, Task task) {
        task.setProjectId(request.projectId());
        task.setDeliveryId(request.deliveryId());
        task.setResponsibleUserId(request.responsibleUserId());
        task.setTitle(request.title().trim());
        task.setDescription(normalizeNullable(request.description()));
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setStatus(normalizeStatus(request.status(), request.dueDate()));
        if (request.active() != null) {
            task.setActive(request.active());
        }
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getProjectId(),
                task.getDeliveryId(),
                task.getResponsibleUserId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getDueDate(),
                normalizeStatus(task.getStatus(), task.getDueDate()),
                isOverdue(task.getStatus(), task.getDueDate()),
                task.isActive(),
                task.getCreatedBy(),
                task.getUpdatedBy(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    TaskStatus normalizeStatus(TaskStatus status, LocalDate dueDate) {
        if (status == TaskStatus.CONCLUIDA || status == TaskStatus.CANCELADA) {
            return status;
        }
        if (dueDate != null && dueDate.isBefore(LocalDate.now())) {
            return TaskStatus.ATRASADA;
        }
        return status == TaskStatus.ATRASADA ? TaskStatus.PENDENTE : status;
    }

    private boolean isOverdue(TaskStatus status, LocalDate dueDate) {
        return normalizeStatus(status, dueDate) == TaskStatus.ATRASADA;
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
