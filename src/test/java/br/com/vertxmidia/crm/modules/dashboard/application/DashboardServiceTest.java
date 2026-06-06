package br.com.vertxmidia.crm.modules.dashboard.application;

import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ClientPerformanceRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CrmEventRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import br.com.vertxmidia.crm.modules.tasks.infrastructure.TaskRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    @Test
    void metricsExposeFinancialAndOperationalHealthForPeriod() {
        ClientRepository clients = mock(ClientRepository.class);
        ContractRepository contracts = mock(ContractRepository.class);
        CrmEventRepository events = mock(CrmEventRepository.class);
        DeliveryRepository deliveries = mock(DeliveryRepository.class);
        FinanceEntryRepository finance = mock(FinanceEntryRepository.class);
        ClientPerformanceRepository performance = mock(ClientPerformanceRepository.class);
        ProjectRepository projects = mock(ProjectRepository.class);
        TaskRepository tasks = mock(TaskRepository.class);
        LocalDate from = LocalDate.of(2026, 5, 1);
        LocalDate to = LocalDate.of(2026, 5, 31);

        when(finance.sumByTypeAndStatusAndDueBetween("receita", "pago", from, to)).thenReturn(new BigDecimal("50000.00"));
        when(finance.sumByTypeAndStatusAndDueBetween(eq("receita"), eq("pago"), eq(LocalDate.of(2026, 3, 31)), eq(LocalDate.of(2026, 4, 30))))
                .thenReturn(new BigDecimal("40000.00"));
        when(finance.sumByTypeAndStatusAndDueBetween("despesa", "pago", from, to)).thenReturn(new BigDecimal("12000.00"));
        when(finance.sumByTypeAndStatusAndDueBetween("comissao", "pago", from, to)).thenReturn(new BigDecimal("3000.00"));
        when(finance.sumByTypeAndStatusAndDueBetween("imposto", "pago", from, to)).thenReturn(new BigDecimal("5000.00"));
        when(finance.sumByTypeAndStatusAndDue("receita", "pago", LocalDate.now())).thenReturn(new BigDecimal("1000.00"));
        when(finance.sumByTypeAndStatusAndDueBetween(eq("receita"), eq("pago"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("50000.00"));

        when(performance.sumLeadsBetween(from, to)).thenReturn(100L);
        when(performance.sumSalesBetween(from, to)).thenReturn(25L);
        when(performance.sumRevenueBetween(from, to)).thenReturn(new BigDecimal("60000.00"));
        when(performance.sumInvestmentBetween(from, to)).thenReturn(new BigDecimal("20000.00"));

        when(clients.countByActiveTrue()).thenReturn(42L);
        when(clients.countByPhaseAndActiveTrue(ClientPhase.FECHADO)).thenReturn(18L);
        when(clients.countByPhaseAndActiveTrue(ClientPhase.PERDIDO)).thenReturn(4L);
        when(contracts.countByStatusAndActiveTrue("ativo")).thenReturn(12L);
        when(contracts.sumMonthlyValueByStatusAndActiveTrue("ativo")).thenReturn(new BigDecimal("30000.00"));
        when(contracts.countByStatusAndEndDateBetweenAndActiveTrue(eq("ativo"), any(LocalDate.class), any(LocalDate.class))).thenReturn(2L);
        when(events.countByStatusAndDateBetweenAndActiveTrue("executada", from, to)).thenReturn(16L);
        when(events.countPendingFollowups(any(LocalDate.class))).thenReturn(5L);
        when(projects.countByStatusAndActiveTrue(ProjectStatus.EM_EXECUCAO)).thenReturn(8L);
        when(projects.countBySlaDueDateLessThanEqualAndStatusNotInAndActiveTrue(any(LocalDate.class), anyList())).thenReturn(3L);
        when(tasks.countByStatusNotInAndActiveTrue(List.of(TaskStatus.CONCLUIDA, TaskStatus.CANCELADA))).thenReturn(20L);
        when(tasks.countByDueDateBeforeAndStatusNotInAndActiveTrue(any(LocalDate.class), anyList())).thenReturn(4L);
        when(deliveries.countByStatusAndFilters("pendente", null, "")).thenReturn(6L);
        when(deliveries.countByStatusAndFilters("producao", null, "")).thenReturn(5L);
        when(deliveries.countByStatusAndFilters("revisao", null, "")).thenReturn(2L);
        when(deliveries.countLateByFilters(any(LocalDate.class), isNull(), eq(""))).thenReturn(3L);

        DashboardService service = new DashboardService(
                clients,
                contracts,
                events,
                deliveries,
                finance,
                performance,
                projects,
                tasks
        );

        var metrics = service.metrics(from, to);

        assertThat(metrics.monthlyRevenue()).isEqualByComparingTo("50000.00");
        assertThat(metrics.periodExpenses()).isEqualByComparingTo("12000.00");
        assertThat(metrics.periodCommissions()).isEqualByComparingTo("3000.00");
        assertThat(metrics.periodTaxes()).isEqualByComparingTo("5000.00");
        assertThat(metrics.netProfit()).isEqualByComparingTo("30000.00");
        assertThat(metrics.profitMargin()).isEqualByComparingTo("60.00");
        assertThat(metrics.pendingDeliveries()).isEqualTo(6);
        assertThat(metrics.productionDeliveries()).isEqualTo(5);
        assertThat(metrics.reviewDeliveries()).isEqualTo(2);
        assertThat(metrics.lateDeliveries()).isEqualTo(3);
        assertThat(metrics.operationalRiskRate()).isEqualByComparingTo("24.39");
    }
}
