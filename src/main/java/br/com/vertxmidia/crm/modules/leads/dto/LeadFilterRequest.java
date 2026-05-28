package br.com.vertxmidia.crm.modules.leads.dto;

import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.LeadOrigin;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import br.com.vertxmidia.crm.modules.leads.domain.LeadTemperature;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LeadFilterRequest(
        String search,
        LeadOrigin origin,
        String segment,
        LeadTemperature temperature,
        LeadStatus status,
        CommercialStage commercialStage,
        UUID responsibleUserId,
        BigDecimal minPotentialValue,
        BigDecimal maxPotentialValue,
        Instant createdFrom,
        Instant createdTo,
        Boolean active
) {
}
