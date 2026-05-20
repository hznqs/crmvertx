package br.com.vertxmidia.crm.modules.client.dto;

import br.com.vertxmidia.crm.modules.client.domain.Client;
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
                client.getNotes(),
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }
}
