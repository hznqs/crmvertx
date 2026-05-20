package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FinanceEntryRequest(
        @NotBlank @Size(max = 40) String type,
        @NotBlank @Size(max = 40) String status,
        @NotBlank @Size(max = 220) String description,
        @DecimalMin("0.00") BigDecimal value,
        @NotNull LocalDate due,
        boolean recurring,
        boolean autoBilling
) {
}
