package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamMemberRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 80) String role,
        @Min(0) Integer tasks,
        @Min(0) Integer completed,
        @Min(0) Integer performance,
        @Size(max = 5000) String notes,
        @Size(max = 10000) String taskBreakdown
) {
}
