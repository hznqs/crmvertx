package br.com.vertxmidia.crm.modules.tasks.dto;

import br.com.vertxmidia.crm.modules.tasks.domain.TaskPriority;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID projectId,
        UUID deliveryId,
        UUID responsibleUserId,
        String title,
        String description,
        TaskPriority priority,
        LocalDate dueDate,
        TaskStatus status,
        Boolean overdue,
        Boolean active,
        UUID createdBy,
        UUID updatedBy,
        Instant createdAt,
        Instant updatedAt
) {
}
