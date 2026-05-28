package br.com.vertxmidia.crm.modules.leads.dto;

import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.LeadOrigin;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import br.com.vertxmidia.crm.modules.leads.domain.LeadTemperature;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LeadResponse(
        UUID id,
        String name,
        String companyName,
        String email,
        String phone,
        LeadOrigin origin,
        String segment,
        LeadTemperature temperature,
        BigDecimal potentialValue,
        UUID responsibleUserId,
        String notes,
        LeadStatus status,
        CommercialStage commercialStage,
        String lostReason,
        Instant convertedAt,
        boolean active,
        UUID createdBy,
        UUID updatedBy,
        Instant createdAt,
        Instant updatedAt
) {
}
