package br.com.vertxmidia.crm.modules.billing.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record BillingClientResponse(
        UUID clientId,
        String clientName,
        BigDecimal monthlyValue,
        Integer months,
        BigDecimal totalValue
) {
}
