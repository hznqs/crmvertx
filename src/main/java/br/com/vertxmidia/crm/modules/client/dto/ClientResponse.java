package br.com.vertxmidia.crm.modules.client.dto;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ClientResponse(
        UUID id,
        String name,
        String phase,
        BigDecimal value,
        Integer months,
        String contact,
        String email,
        String phone,
        String document,
        String clientType,
        DocumentType documentType,
        String segment,
        String origin,
        String responsibleName,
        ClientStatus status,
        ClientPriority priority,
        String tags,
        String addressStreet,
        String addressNumber,
        String addressComplement,
        String addressDistrict,
        String addressCity,
        String addressState,
        String addressZipCode,
        boolean active,
        UUID convertedFromLeadId,
        UUID createdBy,
        UUID updatedBy,
        String notes,
        boolean hasActiveContracts,
        boolean hasContractHistory,
        BigDecimal currentMrr,
        Instant createdAt,
        Instant updatedAt
) {
    public static ClientResponse from(Client client) {
        return from(client, false, false, BigDecimal.ZERO);
    }

    public static ClientResponse from(Client client, boolean hasActiveContracts, boolean hasContractHistory, BigDecimal currentMrr) {
        return new ClientResponse(
                client.getId(),
                client.getName(),
                client.getPhase().value(),
                BigDecimal.ZERO,
                1,
                client.getContactName(),
                client.getEmail(),
                client.getPhone(),
                client.getDocument(),
                client.getClientType(),
                client.getDocumentType(),
                client.getSegment(),
                client.getOrigin(),
                client.getResponsibleName(),
                client.getStatus(),
                client.getPriority(),
                client.getTags(),
                client.getAddressStreet(),
                client.getAddressNumber(),
                client.getAddressComplement(),
                client.getAddressDistrict(),
                client.getAddressCity(),
                client.getAddressState(),
                client.getAddressZipCode(),
                client.isActive(),
                client.getConvertedFromLeadId(),
                client.getCreatedBy(),
                client.getUpdatedBy(),
                client.getNotes(),
                hasActiveContracts,
                hasContractHistory,
                currentMrr,
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }
}
