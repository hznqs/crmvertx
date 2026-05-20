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
        BigDecimal defaultRevenueGoal,
        BigDecimal defaultProfitMargin,
        String preferences,
        Instant updatedAt
) {
    public static CrmSettingsResponse from(CrmSettings settings) {
        return new CrmSettingsResponse(
                settings.getId(),
                settings.getCompanyName(),
                settings.getCompanyEmail(),
                settings.getCompanyPhone(),
                settings.getDefaultRevenueGoal(),
                settings.getDefaultProfitMargin(),
                settings.getPreferences(),
                settings.getUpdatedAt()
        );
    }
}
