package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Delivery;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DeliveryResponse(
        UUID id,
        UUID clientId,
        String type,
        String title,
        String owner,
        LocalDate deadline,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
    public static DeliveryResponse from(Delivery delivery) {
        return new DeliveryResponse(
                delivery.getId(),
                delivery.getClientId(),
                delivery.getType(),
                delivery.getTitle(),
                delivery.getOwner(),
                delivery.getDeadline(),
                delivery.getStatus(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt()
        );
    }
}
