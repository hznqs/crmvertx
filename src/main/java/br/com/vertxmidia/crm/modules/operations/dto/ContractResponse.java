package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ContractResponse(
        UUID id,
        UUID clientId,
        String plan,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        boolean autoRenew,
        Instant createdAt,
        Instant updatedAt
) {
    public static ContractResponse from(Contract contract) {
        return new ContractResponse(
                contract.getId(),
                contract.getClientId(),
                contract.getPlan(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getStatus(),
                contract.isAutoRenew(),
                contract.getCreatedAt(),
                contract.getUpdatedAt()
        );
    }
}
