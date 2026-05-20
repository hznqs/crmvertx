package br.com.vertxmidia.crm.modules.dashboard.application;

import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.dashboard.dto.DashboardMetricsResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ClientPerformanceRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CrmEventRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.time.LocalDate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final ClientRepository clients;
    private final ContractRepository contracts;
    private final CrmEventRepository events;
    private final DeliveryRepository deliveries;
    private final FinanceEntryRepository financeEntries;
    private final ClientPerformanceRepository performanceRecords;

    public DashboardService(
            ClientRepository clients,
            ContractRepository contracts,
            CrmEventRepository events,
            DeliveryRepository deliveries,
            FinanceEntryRepository financeEntries,
            ClientPerformanceRepository performanceRecords
    ) {
        this.clients = clients;
        this.contracts = contracts;
        this.events = events;
        this.deliveries = deliveries;
        this.financeEntries = financeEntries;
        this.performanceRecords = performanceRecords;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardMetrics", key = "#from + ':' + #to")
    public DashboardMetricsResponse metrics(LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now();
        LocalDate periodStart = from == null ? today.withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        if (periodEnd.isBefore(periodStart)) {
            throw new IllegalArgumentException("Data final do dashboard nao pode ser anterior a data inicial");
        }
        long periodDays = ChronoUnit.DAYS.between(periodStart, periodEnd) + 1;
        LocalDate previousPeriodEnd = periodStart.minusDays(1);
        LocalDate previousPeriodStart = previousPeriodEnd.minusDays(periodDays - 1);

        // Receitas por período
        BigDecimal monthlyRevenue = financeEntries.sumByTypeAndStatusAndDueBetween("receita", "pago", periodStart, periodEnd);
        BigDecimal previousMonthlyRevenue = financeEntries.sumByTypeAndStatusAndDueBetween("receita", "pago", previousPeriodStart, previousPeriodEnd);
        BigDecimal mrr = financeEntries.sumRecurringByTypeAndStatus("receita", "pago");

        // Faturamento diário (hoje) e semanal (últimos 7 dias)
        BigDecimal dailyRevenue = financeEntries.sumByTypeAndStatusAndDue("receita", "pago", today);
        BigDecimal weeklyRevenue = financeEntries.sumByTypeAndStatusAndDueBetween("receita", "pago", today.minusDays(6), today);

        // Performance (conversão e ROI)
        long leads = performanceRecords.sumLeadsBetween(periodStart, periodEnd);
        long sales = performanceRecords.sumSalesBetween(periodStart, periodEnd);
        BigDecimal mediaRevenue = performanceRecords.sumRevenueBetween(periodStart, periodEnd);
        BigDecimal investment = performanceRecords.sumInvestmentBetween(periodStart, periodEnd);

        // Follow-ups pendentes: eventos futuros ainda nao executados.
        long pendingFollowups = events.countPendingFollowups(today);

        // Total de clientes
        long totalClients = clients.count();

        return new DashboardMetricsResponse(
                monthlyRevenue,
                clients.countByPhase(ClientPhase.FECHADO),
                clients.countByPhase(ClientPhase.PERDIDO),
                contracts.countByStatusAndEndDateBetween("ativo", today, today.plusDays(30)),
                contracts.countByStatus("ativo"),
                events.countByStatusAndDateBetween("executada", periodStart, periodEnd),
                deliveries.countByDeadlineBeforeAndStatusNot(today, "aprovado"),
                percentage(BigDecimal.valueOf(sales), BigDecimal.valueOf(leads)),
                roi(mediaRevenue, investment),
                clients.averageTicketByPhase(ClientPhase.FECHADO),
                mrr,
                growth(monthlyRevenue, previousMonthlyRevenue),
                dailyRevenue,
                weeklyRevenue,
                pendingFollowups,
                totalClients
        );
    }

    private BigDecimal percentage(BigDecimal value, BigDecimal total) {
        if (total.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return value.multiply(ONE_HUNDRED).divide(total, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal roi(BigDecimal revenue, BigDecimal investment) {
        if (investment.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return revenue.subtract(investment)
                .multiply(ONE_HUNDRED)
                .divide(investment, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal growth(BigDecimal current, BigDecimal previous) {
        if (previous.signum() == 0) {
            return current.signum() > 0 ? ONE_HUNDRED : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .multiply(ONE_HUNDRED)
                .divide(previous, 2, RoundingMode.HALF_UP);
    }
}
