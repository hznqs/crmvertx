package br.com.vertxmidia.crm.modules.leads.dto;

import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import java.time.Instant;
import java.util.UUID;

public record LeadStageHistoryResponse(
        UUID id,
        UUID leadId,
        CommercialStage fromStage,
        CommercialStage toStage,
        LeadStatus fromStatus,
        LeadStatus toStatus,
        String reason,
        UUID changedBy,
        Instant createdAt
) {
}
