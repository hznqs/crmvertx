package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FinanceEntryRequest(
        @NotBlank
        @Pattern(regexp = "^(receita|despesa|comissao|imposto)$", message = "Tipo financeiro invalido")
        @Size(max = 40) String type,
        @NotBlank
        @Pattern(regexp = "^(pago|pendente|vencido)$", message = "Status financeiro invalido")
        @Size(max = 40) String status,
        @NotBlank @Size(max = 220) String description,
        @DecimalMin("0.00") BigDecimal value,
        @NotNull LocalDate due,
        boolean recurring,
        boolean autoBilling
) {
}
