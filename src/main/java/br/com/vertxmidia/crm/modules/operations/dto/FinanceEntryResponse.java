package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FinanceEntryResponse(
        UUID id,
        String type,
        String status,
        String description,
        BigDecimal value,
        LocalDate due,
        boolean recurring,
        boolean autoBilling,
        Instant createdAt,
        Instant updatedAt
) {
    public static FinanceEntryResponse from(FinanceEntry entry) {
        return new FinanceEntryResponse(
                entry.getId(),
                entry.getType(),
                entry.getStatus(),
                entry.getDescription(),
                entry.getValue(),
                entry.getDue(),
                entry.isRecurring(),
                entry.isAutoBilling(),
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }
}
