package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CommissionSaleRequest(
        @NotNull UUID memberId,
        @Pattern(regexp = "^(VENDA|RENOVACAO|RECORRENCIA|BONUS|MANUAL)$", message = "Tipo de comissao invalido")
        String type,
        @Pattern(regexp = "^(PENDENTE|APROVADA|PAGA|CANCELADA)$", message = "Status de comissao invalido")
        String status,
        UUID contractId,
        UUID financeEntryId,
        UUID clientId,
        @Size(max = 180) String client,
        @Pattern(regexp = "^(PERCENTUAL|FIXA)$", message = "Tipo de calculo de comissao invalido")
        String calculationType,
        @DecimalMin("0.00") BigDecimal value,
        @DecimalMin("0.00") BigDecimal percent,
        @DecimalMin("0.00") BigDecimal fixedValue,
        LocalDate referenceMonth,
        @Min(0) Integer goal,
        Boolean active
) {
}
