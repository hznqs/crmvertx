package br.com.vertxmidia.crm.modules.tasks.dto;

import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull TaskStatus status
) {
}
