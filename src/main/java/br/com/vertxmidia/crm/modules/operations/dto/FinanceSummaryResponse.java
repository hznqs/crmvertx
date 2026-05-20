package br.com.vertxmidia.crm.modules.operations.dto;

import java.math.BigDecimal;

public record FinanceSummaryResponse(
        BigDecimal recurringRevenue,
        BigDecimal forecast,
        BigDecimal netProfit,
        BigDecimal margin,
        BigDecimal overdue,
        long autoBillingCount,
        BigDecimal commissions,
        BigDecimal taxes,
        BigDecimal grossRevenue,
        BigDecimal expenses
) {
}
