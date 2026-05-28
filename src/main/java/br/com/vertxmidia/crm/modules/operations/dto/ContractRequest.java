package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContractRequest(
        UUID clientId,
        UUID serviceId,
        UUID projectId,
        @NotBlank @Size(max = 120) String plan,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank
        @Pattern(regexp = "^(ativo|encerrado|pausado|cancelado)$", message = "Status de contrato invalido")
        @Size(max = 40) String status,
        boolean autoRenew,
        @DecimalMin("0.00") BigDecimal monthlyValue,
        @DecimalMin("0.00") BigDecimal totalValue,
        @Min(1) @Max(600) Integer durationMonths,
        @Min(1) @Max(31) Integer billingDueDay,
        Boolean active
) {
}
