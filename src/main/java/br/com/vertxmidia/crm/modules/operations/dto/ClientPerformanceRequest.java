package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ClientPerformanceRequest(
        UUID clientId,
        @NotNull LocalDate date,
        @Min(0) Integer leads,
        @Min(0) Integer sales,
        @DecimalMin("0.00") BigDecimal revenue,
        @DecimalMin("0.00") BigDecimal investment,
        Boolean active
) {
}
