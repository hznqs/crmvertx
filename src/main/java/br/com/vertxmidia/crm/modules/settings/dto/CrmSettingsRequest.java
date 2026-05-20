package br.com.vertxmidia.crm.modules.settings.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CrmSettingsRequest(
        @NotBlank @Size(max = 180) String companyName,
        @Email @Size(max = 180) String companyEmail,
        @Size(max = 40) String companyPhone,
        @DecimalMin("0.00") BigDecimal defaultRevenueGoal,
        @DecimalMin("0.00") BigDecimal defaultProfitMargin,
        @Size(max = 10000) String preferences
) {
}
