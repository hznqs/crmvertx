package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CrmEventResponse(
        UUID id,
        UUID clientId,
        String type,
        String title,
        LocalDate date,
        LocalTime time,
        String status,
        boolean sale,
        BigDecimal revenue,
        String notes,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static CrmEventResponse from(CrmEvent event) {
        return new CrmEventResponse(
                event.getId(),
                event.getClientId(),
                event.getType(),
                event.getTitle(),
                event.getDate(),
                event.getTime(),
                event.getStatus(),
                event.isSale(),
                event.getRevenue(),
                event.getNotes(),
                event.isActive(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
