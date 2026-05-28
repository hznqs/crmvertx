package br.com.vertxmidia.crm.modules.projects.dto;

import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectFilterRequest(
        String search,
        UUID clientId,
        UUID contractId,
        UUID serviceId,
        ProjectStatus status,
        UUID responsibleUserId,
        LocalDate slaFrom,
        LocalDate slaTo,
        Boolean active,
        Instant createdFrom,
        Instant createdTo
) {
}
