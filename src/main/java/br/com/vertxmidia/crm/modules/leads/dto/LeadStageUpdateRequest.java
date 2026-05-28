package br.com.vertxmidia.crm.modules.leads.dto;

import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LeadStageUpdateRequest(
        @NotNull CommercialStage commercialStage,
        @Size(max = 240) String lostReason
) {
    @AssertTrue(message = "Informe o motivo da perda para leads perdidos")
    public boolean hasLostReasonWhenLost() {
        return commercialStage != CommercialStage.PERDIDO || (lostReason != null && !lostReason.isBlank());
    }
}
