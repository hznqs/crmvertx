package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CommissionSaleRequest(
        @NotNull UUID memberId,
        @Pattern(regexp = "^(VENDA|RENOVACAO|RECORRENCIA|BONUS|MANUAL)$", message = "Tipo de comissao invalido")
        String type,
        @Pattern(regexp = "^(PENDENTE|APROVADA|PAGA|CANCELADA)$", message = "Status de comissao invalido")
        String status,
        UUID contractId,
        UUID financeEntryId,
        @Size(max = 180) String client,
        @DecimalMin("0.00") BigDecimal value,
        @DecimalMin("0.00") BigDecimal percent,
        @Min(0) Integer goal,
        Boolean active
) {
}
