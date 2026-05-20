package br.com.vertxmidia.crm.modules.settings.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CrmSettingsRequest(
        @NotBlank @Size(max = 180) String companyName,
        @Email @Size(max = 180) String companyEmail,
        @Size(max = 40) String companyPhone,
        @Size(max = 40) String companyDocument,
        @Size(max = 200) String companyWebsite,
        @Size(max = 280) String companyAddress,
        @DecimalMin("0.00") BigDecimal defaultRevenueGoal,
        @DecimalMin("0.00") BigDecimal defaultProfitMargin,
        @Pattern(regexp = "^[A-Z]{3,8}$", message = "Moeda deve usar codigo ISO em letras maiusculas")
        String defaultCurrency,
        @Size(max = 80) String defaultTimezone,
        @DecimalMin("0.00") BigDecimal defaultTaxRate,
        @DecimalMin("0.00") BigDecimal defaultCommissionRate,
        @DecimalMin("0.00") BigDecimal agencyRevenueGoal,
        @Min(0) Integer agencyNewClientsGoal,
        @DecimalMin("0.00") BigDecimal agencyAverageTicketGoal,
        @DecimalMin("0.00") BigDecimal agencyRetentionGoal,
        @Min(0) Integer agencyProposalsGoal,
        @Min(0) Integer agencyMeetingsGoal,
        @Size(max = 10000) String preferences,
        @Size(max = 10000) String crmRules
) {
}
