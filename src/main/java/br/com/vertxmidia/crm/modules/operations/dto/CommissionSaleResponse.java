package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CommissionSaleResponse(
        UUID id,
        UUID memberId,
        String type,
        String status,
        UUID contractId,
        UUID financeEntryId,
        String client,
        BigDecimal value,
        BigDecimal percent,
        BigDecimal commissionValue,
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
                sale.getClient(),
                sale.getValue(),
                sale.getPercent(),
                sale.getValue().multiply(sale.getPercent()).divide(BigDecimal.valueOf(100)),
                sale.getGoal(),
                sale.getPaidAt(),
                sale.isActive(),
                sale.getCreatedAt(),
                sale.getUpdatedAt()
        );
    }
}
