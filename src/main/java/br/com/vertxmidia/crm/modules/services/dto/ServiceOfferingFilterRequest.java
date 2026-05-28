package br.com.vertxmidia.crm.modules.services.dto;

import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import br.com.vertxmidia.crm.modules.services.domain.ServiceCategory;
import java.math.BigDecimal;
import java.time.Instant;

public record ServiceOfferingFilterRequest(
        String search,
        ServiceCategory category,
        ServiceBillingType billingType,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Boolean active,
        Instant createdFrom,
        Instant createdTo
) {
}
