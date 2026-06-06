package br.com.vertxmidia.crm.modules.tasks.dto;

import br.com.vertxmidia.crm.modules.tasks.domain.TaskPriority;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record TaskRequest(
        @NotNull UUID projectId,
        UUID deliveryId,
        UUID clientId,
        UUID contractId,
        UUID serviceId,
        UUID responsibleUserId,
        @NotBlank @Size(max = 180) String title,
        @Size(max = 10000) String description,
        @Size(max = 10000) String checklist,
        @Size(max = 10000) String comments,
        @NotNull TaskPriority priority,
        @NotNull LocalDate dueDate,
        @NotNull TaskStatus status,
        Integer sortOrder,
        Boolean active
) {
}
