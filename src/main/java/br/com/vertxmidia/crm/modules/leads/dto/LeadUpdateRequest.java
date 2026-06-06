package br.com.vertxmidia.crm.modules.leads.dto;

import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.LeadOrigin;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import br.com.vertxmidia.crm.modules.leads.domain.LeadTemperature;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LeadUpdateRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 160) String companyName,
        @Email @Size(max = 180) String email,
        @Size(max = 40) String phone,
        @NotNull LeadOrigin origin,
        @Size(max = 100) String segment,
        @NotNull LeadTemperature temperature,
        @NotNull @DecimalMin("0.00") BigDecimal potentialValue,
        UUID responsibleUserId,
        @Size(max = 160) String responsibleName,
        @Size(max = 180) String serviceInterest,
        @Size(max = 240) String nextAction,
        LocalDate nextActionDate,
        @Size(max = 5000) String notes,
        @NotNull LeadStatus status,
        @NotNull CommercialStage commercialStage,
        @Size(max = 240) String lostReason
) {
    @AssertTrue(message = "Informe pelo menos email ou telefone")
    public boolean hasContact() {
        return hasText(email) || hasText(phone);
    }

    @AssertTrue(message = "Informe o motivo da perda para leads perdidos")
    public boolean hasLostReasonWhenLost() {
        return commercialStage != CommercialStage.PERDIDO || hasText(lostReason);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
