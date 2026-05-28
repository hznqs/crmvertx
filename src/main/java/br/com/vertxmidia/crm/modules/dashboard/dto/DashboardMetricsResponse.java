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
        BigDecimal monthlyGrowth,
        BigDecimal dailyRevenue,
        BigDecimal weeklyRevenue,
        long pendingFollowups,
        long totalClients,
        long projectsInExecution,
        long projectsAtRisk,
        long openTasks,
        long lateTasks,
        BigDecimal periodExpenses,
        BigDecimal periodCommissions,
        BigDecimal periodTaxes,
        BigDecimal netProfit,
        BigDecimal profitMargin,
        long pendingDeliveries,
        long productionDeliveries,
        long reviewDeliveries,
        long lateDeliveries,
        BigDecimal operationalRiskRate
) {
}
