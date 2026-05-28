package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.ClientPerformance;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ClientPerformanceResponse(
        UUID id,
        UUID clientId,
        LocalDate date,
        Integer leads,
        Integer sales,
        BigDecimal revenue,
        BigDecimal investment,
        BigDecimal cpl,
        BigDecimal conversionRate,
        BigDecimal roi,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static ClientPerformanceResponse from(ClientPerformance record) {
        return new ClientPerformanceResponse(
                record.getId(),
                record.getClientId(),
                record.getDate(),
                record.getLeads(),
                record.getSales(),
                record.getRevenue(),
                record.getInvestment(),
                cpl(record),
                conversionRate(record),
                roi(record),
                record.isActive(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }

    private static BigDecimal cpl(ClientPerformance record) {
        if (record.getLeads() == null || record.getLeads() <= 0) {
            return BigDecimal.ZERO;
        }
        return record.getInvestment().divide(BigDecimal.valueOf(record.getLeads()), 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal conversionRate(ClientPerformance record) {
        if (record.getLeads() == null || record.getLeads() <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(record.getSales())
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(record.getLeads()), 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal roi(ClientPerformance record) {
        if (record.getInvestment().signum() == 0) {
            return BigDecimal.ZERO;
        }
        return record.getRevenue()
                .subtract(record.getInvestment())
                .multiply(BigDecimal.valueOf(100))
                .divide(record.getInvestment(), 2, RoundingMode.HALF_UP);
    }
}
