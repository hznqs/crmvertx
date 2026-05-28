package br.com.vertxmidia.crm.modules.client.dto;

import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record ClientRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 40) String phase,
        @NotNull @DecimalMin("0.00") BigDecimal value,
        @NotNull @Min(1) Integer months,
        @NotBlank @Size(max = 160) String contact,
        @Email @Size(max = 180) String email,
        @Size(max = 40) String phone,
        @Size(max = 32) String document,
        DocumentType documentType,
        @Size(max = 100) String segment,
        ClientStatus status,
        ClientPriority priority,
        @Size(max = 1000) String tags,
        @Size(max = 180) String addressStreet,
        @Size(max = 40) String addressNumber,
        @Size(max = 120) String addressComplement,
        @Size(max = 120) String addressDistrict,
        @Size(max = 120) String addressCity,
        @Size(min = 2, max = 2) String addressState,
        @Size(max = 20) String addressZipCode,
        UUID convertedFromLeadId,
        @Size(max = 5000) String notes
) {
    @AssertTrue(message = "Informe pelo menos email ou telefone")
    public boolean hasContactChannel() {
        return hasText(email) || hasText(phone);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
