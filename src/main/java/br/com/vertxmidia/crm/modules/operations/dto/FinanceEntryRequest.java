package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FinanceEntryRequest(
        UUID clientId,
        UUID contractId,
        UUID projectId,
        UUID serviceId,
        @NotBlank
        @Pattern(regexp = "^(receita|despesa|comissao|imposto)$", message = "Tipo financeiro invalido")
        @Size(max = 40) String type,
        @NotBlank
        @Pattern(regexp = "^(pago|pendente|vencido|cancelado)$", message = "Status financeiro invalido")
        @Size(max = 40) String status,
        @NotBlank @Size(max = 220) String description,
        @DecimalMin("0.00") BigDecimal value,
        @NotNull LocalDate due,
        boolean recurring,
        boolean autoBilling,
        @Pattern(regexp = "^(operacional|vendas|marketing|desenvolvimento|administrativo|ferramentas)$", message = "Centro de custo invalido")
        String costCenter,
        Boolean active
) {
}
