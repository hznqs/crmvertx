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
import java.util.List;
import java.util.UUID;

public record ContractRequest(
        @NotNull UUID clientId,
        List<UUID> serviceIds,
        UUID serviceId,
        UUID projectId,
        @Size(max = 160) String sellerName,
        @NotBlank @Size(max = 120) String plan,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank
        @Pattern(regexp = "^(rascunho|pendente|ativo|vencido|cancelado|concluido|encerrado|pausado)$", message = "Status de contrato invalido")
        @Size(max = 40) String status,
        boolean autoRenew,
        BigDecimal monthlyValue,
        @DecimalMin("0.00") BigDecimal implementationFee,
        @DecimalMin("0.00") BigDecimal discount,
        BigDecimal totalValue,
        @Min(0) @Max(600) Integer durationMonths,
        @Min(1) @Max(31) Integer billingDueDay,
        @Size(max = 80) String paymentMethod,
        @Size(max = 10000) String notes,
        Boolean generateProject,
        Boolean active
) {
}
