package br.com.vertxmidia.crm.modules.billing.dto;

import java.math.BigDecimal;
import java.util.List;

public record BillingSummaryResponse(
        BigDecimal totalRevenue,
        BigDecimal averageTicket,
        long activeContracts,
        List<BillingClientResponse> clients
) {
}
