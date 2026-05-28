package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Delivery;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DeliveryResponse(
        UUID id,
        UUID clientId,
        UUID projectId,
        UUID contractId,
        UUID serviceId,
        String type,
        String title,
        String description,
        String owner,
        LocalDate deadline,
        String status,
        Instant approvedAt,
        Instant deliveredAt,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static DeliveryResponse from(Delivery delivery) {
        return new DeliveryResponse(
                delivery.getId(),
                delivery.getClientId(),
                delivery.getProjectId(),
                delivery.getContractId(),
                delivery.getServiceId(),
                delivery.getType(),
                delivery.getTitle(),
                delivery.getDescription(),
                delivery.getOwner(),
                delivery.getDeadline(),
                delivery.getStatus(),
                delivery.getApprovedAt(),
                delivery.getDeliveredAt(),
                delivery.isActive(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt()
        );
    }
}
