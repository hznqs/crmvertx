package br.com.vertxmidia.crm.modules.operations.dto;

import java.math.BigDecimal;

public record CommissionSalesMetricsResponse(
        long totalSales,
        BigDecimal totalRevenue,
        BigDecimal totalCommission
) {
}
