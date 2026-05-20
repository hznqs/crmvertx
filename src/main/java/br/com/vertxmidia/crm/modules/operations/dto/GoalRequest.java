package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @DecimalMin("0.00") BigDecimal target,
        @NotNull LocalDate date
) {
}
