package br.com.vertxmidia.crm.modules.services.dto;

import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import br.com.vertxmidia.crm.modules.services.domain.ServiceCategory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ServiceOfferingResponse(
        UUID id,
        String name,
        ServiceCategory category,
        String description,
        ServiceBillingType billingType,
        BigDecimal basePrice,
        Integer slaDays,
        BigDecimal estimatedHours,
        String defaultChecklist,
        String deliveryStages,
        BigDecimal commissionPercentage,
        BigDecimal grossMarginPercentage,
        Boolean active,
        UUID createdBy,
        UUID updatedBy,
        Instant createdAt,
        Instant updatedAt
) {
}
