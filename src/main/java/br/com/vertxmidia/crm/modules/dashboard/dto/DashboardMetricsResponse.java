package br.com.vertxmidia.crm.modules.dashboard.dto;

import java.math.BigDecimal;

public record DashboardMetricsResponse(
        BigDecimal monthlyRevenue,
        long activeClients,
        long lostClients,
        long contractsExpiring,
        long activeContracts,
        long completedMeetings,
        long overdueTasks,
        BigDecimal conversionRate,
        BigDecimal clientRoi,
        BigDecimal averageTicket,
        BigDecimal mrr,
        BigDecimal monthlyGrowth
) {
}
