package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.ClientPerformance;
import java.math.BigDecimal;
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
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
