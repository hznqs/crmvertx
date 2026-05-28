package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import java.math.BigDecimal;
import java.util.UUID;

public record TeamMemberRequest(
        UUID userId,
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 80) String role,
        @Email @Size(max = 180) String email,
        @Size(max = 40) String phone,
        @Min(0) Integer tasks,
        @Min(0) Integer completed,
        @Min(0) Integer performance,
        @Size(max = 5000) String notes,
        @Size(max = 10000) String taskBreakdown,
        @DecimalMin("0.00") BigDecimal hourlyCost,
        @Min(1) @Max(744) Integer capacityHoursMonth,
        Boolean active
) {
}
