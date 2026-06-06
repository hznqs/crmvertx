package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CommissionSaleResponse(
        UUID id,
        UUID memberId,
        String type,
        String status,
        UUID contractId,
        UUID financeEntryId,
        UUID clientId,
        String client,
        String calculationType,
        BigDecimal value,
        BigDecimal percent,
        BigDecimal fixedValue,
        BigDecimal commissionValue,
        LocalDate referenceMonth,
        int goal,
        Instant paidAt,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static CommissionSaleResponse from(CommissionSale sale) {
        return new CommissionSaleResponse(
                sale.getId(),
                sale.getMemberId(),
                sale.getType(),
                sale.getStatus(),
                sale.getContractId(),
                sale.getFinanceEntryId(),
                sale.getClientId(),
                sale.getClient(),
                sale.getCalculationType(),
                sale.getValue(),
                sale.getPercent(),
                sale.getFixedValue(),
                commissionValue(sale),
                sale.getReferenceMonth(),
                sale.getGoal(),
                sale.getPaidAt(),
                sale.isActive(),
                sale.getCreatedAt(),
                sale.getUpdatedAt()
        );
    }

    private static BigDecimal commissionValue(CommissionSale sale) {
        if ("FIXA".equalsIgnoreCase(sale.getCalculationType())) {
            return safe(sale.getFixedValue()).setScale(2, RoundingMode.HALF_UP);
        }
        return safe(sale.getValue())
                .multiply(safe(sale.getPercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
