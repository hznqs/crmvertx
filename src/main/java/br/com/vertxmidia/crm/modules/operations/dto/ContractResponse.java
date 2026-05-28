package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ContractResponse(
        UUID id,
        UUID clientId,
        UUID serviceId,
        UUID projectId,
        String plan,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        boolean autoRenew,
        BigDecimal monthlyValue,
        BigDecimal totalValue,
        Integer durationMonths,
        Integer billingDueDay,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static ContractResponse from(Contract contract) {
        return new ContractResponse(
                contract.getId(),
                contract.getClientId(),
                contract.getServiceId(),
                contract.getProjectId(),
                contract.getPlan(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getStatus(),
                contract.isAutoRenew(),
                contract.getMonthlyValue(),
                contract.getTotalValue(),
                contract.getDurationMonths(),
                contract.getBillingDueDay(),
                contract.isActive(),
                contract.getCreatedAt(),
                contract.getUpdatedAt()
        );
    }
}
