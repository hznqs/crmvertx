package br.com.vertxmidia.crm.modules.tasks.dto;

import br.com.vertxmidia.crm.modules.tasks.domain.TaskPriority;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskFilterRequest(
        String search,
        UUID projectId,
        UUID deliveryId,
        UUID responsibleUserId,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueFrom,
        LocalDate dueTo,
        Boolean active,
        Instant createdFrom,
        Instant createdTo
) {
}
