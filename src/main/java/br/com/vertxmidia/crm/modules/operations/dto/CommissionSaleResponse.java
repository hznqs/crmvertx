package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CommissionSaleResponse(
        UUID id,
        UUID memberId,
        String client,
        BigDecimal value,
        BigDecimal percent,
        int goal,
        Instant createdAt,
        Instant updatedAt
) {
    public static CommissionSaleResponse from(CommissionSale sale) {
        return new CommissionSaleResponse(
                sale.getId(),
                sale.getMemberId(),
                sale.getClient(),
                sale.getValue(),
                sale.getPercent(),
                sale.getGoal(),
                sale.getCreatedAt(),
                sale.getUpdatedAt()
        );
    }
}
