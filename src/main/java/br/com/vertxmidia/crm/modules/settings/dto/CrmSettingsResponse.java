package br.com.vertxmidia.crm.modules.settings.dto;

import br.com.vertxmidia.crm.modules.settings.domain.CrmSettings;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CrmSettingsResponse(
        UUID id,
        String companyName,
        String companyEmail,
        String companyPhone,
        String companyDocument,
        String companyWebsite,
        String companyAddress,
        BigDecimal defaultRevenueGoal,
        BigDecimal defaultProfitMargin,
        String defaultCurrency,
        String defaultTimezone,
        BigDecimal defaultTaxRate,
        BigDecimal defaultCommissionRate,
        BigDecimal agencyRevenueGoal,
        Integer agencyNewClientsGoal,
        BigDecimal agencyAverageTicketGoal,
        BigDecimal agencyRetentionGoal,
        Integer agencyProposalsGoal,
        Integer agencyMeetingsGoal,
        String preferences,
        String crmRules,
        Instant updatedAt
) {
    public static CrmSettingsResponse from(CrmSettings settings) {
        return new CrmSettingsResponse(
                settings.getId(),
                settings.getCompanyName(),
                settings.getCompanyEmail(),
                settings.getCompanyPhone(),
                settings.getCompanyDocument(),
                settings.getCompanyWebsite(),
                settings.getCompanyAddress(),
                settings.getDefaultRevenueGoal(),
                settings.getDefaultProfitMargin(),
                settings.getDefaultCurrency(),
                settings.getDefaultTimezone(),
                settings.getDefaultTaxRate(),
                settings.getDefaultCommissionRate(),
                settings.getAgencyRevenueGoal(),
                settings.getAgencyNewClientsGoal(),
                settings.getAgencyAverageTicketGoal(),
                settings.getAgencyRetentionGoal(),
                settings.getAgencyProposalsGoal(),
                settings.getAgencyMeetingsGoal(),
                settings.getPreferences(),
                settings.getCrmRules(),
                settings.getUpdatedAt()
        );
    }
}
