package br.com.vertxmidia.crm.modules.projects.dto;

import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        UUID clientId,
        UUID contractId,
        UUID serviceId,
        String name,
        String description,
        ProjectStatus status,
        UUID responsibleUserId,
        String teamMemberIds,
        LocalDate startDate,
        String priority,
        Integer progress,
        LocalDate slaDueDate,
        BigDecimal budget,
        BigDecimal estimatedCost,
        BigDecimal actualCost,
        BigDecimal estimatedProfit,
        BigDecimal actualProfit,
        Boolean active,
        UUID createdBy,
        UUID updatedBy,
        Instant createdAt,
        Instant updatedAt
) {
}
