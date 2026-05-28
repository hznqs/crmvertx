package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FinanceEntryResponse(
        UUID id,
        UUID clientId,
        UUID contractId,
        UUID projectId,
        UUID serviceId,
        String type,
        String status,
        String description,
        BigDecimal value,
        LocalDate due,
        boolean recurring,
        boolean autoBilling,
        String costCenter,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static FinanceEntryResponse from(FinanceEntry entry) {
        return new FinanceEntryResponse(
                entry.getId(),
                entry.getClientId(),
                entry.getContractId(),
                entry.getProjectId(),
                entry.getServiceId(),
                entry.getType(),
                entry.getStatus(),
                entry.getDescription(),
                entry.getValue(),
                entry.getDue(),
                entry.isRecurring(),
                entry.isAutoBilling(),
                entry.getCostCenter(),
                entry.isActive(),
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }
}
