package br.com.vertxmidia.crm.modules.projects.dto;

import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusUpdateRequest(
        @NotNull ProjectStatus status,
        @Min(0) @Max(100) Integer progress
) {
}
