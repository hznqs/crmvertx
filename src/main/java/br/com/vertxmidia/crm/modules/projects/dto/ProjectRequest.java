package br.com.vertxmidia.crm.modules.projects.dto;

import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectRequest(
        @NotNull UUID clientId,
        UUID contractId,
        UUID serviceId,
        @NotBlank @Size(max = 180) String name,
        @Size(max = 10000) String description,
        @NotNull ProjectStatus status,
        UUID responsibleUserId,
        @Size(max = 5000) String teamMemberIds,
        @NotNull @Min(0) @Max(100) Integer progress,
        LocalDate slaDueDate,
        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal budget,
        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal estimatedCost,
        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal actualCost,
        Boolean active
) {
}
