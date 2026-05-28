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
        DocumentType documentType,
        String segment,
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
        Instant createdAt,
        Instant updatedAt
) {
    public static ClientResponse from(Client client) {
        return new ClientResponse(
                client.getId(),
                client.getName(),
                client.getPhase().value(),
                client.getContractValue(),
                client.getContractMonths(),
                client.getContactName(),
                client.getEmail(),
                client.getPhone(),
                client.getDocument(),
                client.getDocumentType(),
                client.getSegment(),
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
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }
}
