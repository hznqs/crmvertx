package br.com.vertxmidia.crm.modules.dashboard.application;

import br.com.vertxmidia.crm.modules.dashboard.dto.MeetingsSalesChartPoint;
import br.com.vertxmidia.crm.modules.dashboard.dto.RevenueChartPoint;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CrmEventRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardChartService {

    private final FinanceEntryRepository financeEntries;
    private final CrmEventRepository events;
    private final br.com.vertxmidia.crm.modules.leads.infrastructure.LeadRepository leads;
    private final br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository contracts;
    private final br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository projects;

    public DashboardChartService(
            FinanceEntryRepository financeEntries, 
            CrmEventRepository events,
            br.com.vertxmidia.crm.modules.leads.infrastructure.LeadRepository leads,
            br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository contracts,
            br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository projects
    ) {
        this.financeEntries = financeEntries;
        this.events = events;
        this.leads = leads;
        this.contracts = contracts;
        this.projects = projects;
    }

    /**
     * Retorna faturamento diário por dia dentro de um período.
     * Dias sem dados aparecem como 0, garantindo série contínua no gráfico.
     */
    @Transactional(readOnly = true)
    public List<RevenueChartPoint> revenueByDay(LocalDate from, LocalDate to) {
        LocalDate periodStart = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        validateRange(periodStart, periodEnd);

        List<Object[]> rows = financeEntries.revenueByDay("receita", "pago", periodStart, periodEnd);
        Map<LocalDate, BigDecimal> byDate = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            BigDecimal total = (BigDecimal) row[1];
            byDate.put(date, total);
        }

        List<RevenueChartPoint> result = new ArrayList<>();
        LocalDate cursor = periodStart;
        while (!cursor.isAfter(periodEnd)) {
            result.add(new RevenueChartPoint(cursor, byDate.getOrDefault(cursor, BigDecimal.ZERO)));
            cursor = cursor.plusDays(1);
        }
        return result;
    }

    /**
     * Retorna reuniões realizadas e fechamentos por dia dentro de um período.
     */
    @Transactional(readOnly = true)
    public List<MeetingsSalesChartPoint> meetingsSalesByDay(LocalDate from, LocalDate to) {
        LocalDate periodStart = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        validateRange(periodStart, periodEnd);

        List<Object[]> meetingRows = events.countByDayBetween("executada", periodStart, periodEnd);
        List<Object[]> salesRows = events.countSalesByDayBetween(periodStart, periodEnd);

        Map<LocalDate, Long> meetingsByDate = toDateMap(meetingRows);
        Map<LocalDate, Long> salesByDate = toDateMap(salesRows);

        List<MeetingsSalesChartPoint> result = new ArrayList<>();
        LocalDate cursor = periodStart;
        while (!cursor.isAfter(periodEnd)) {
            result.add(new MeetingsSalesChartPoint(
                    cursor,
                    meetingsByDate.getOrDefault(cursor, 0L),
                    salesByDate.getOrDefault(cursor, 0L)
            ));
            cursor = cursor.plusDays(1);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString> pipelineFunnel(LocalDate from, LocalDate to) {
        LocalDate periodStart = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        validateRange(periodStart, periodEnd);
        java.time.ZoneId zone = java.time.ZoneId.of("UTC");
        java.time.Instant start = periodStart.atStartOfDay(zone).toInstant();
        java.time.Instant end = periodEnd.plusDays(1).atStartOfDay(zone).toInstant();
        return leads.countByCommercialStageBetween(start, end);
    }

    @Transactional(readOnly = true)
    public List<br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString> leadsOrigin(LocalDate from, LocalDate to) {
        LocalDate periodStart = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        validateRange(periodStart, periodEnd);
        java.time.ZoneId zone = java.time.ZoneId.of("UTC");
        java.time.Instant start = periodStart.atStartOfDay(zone).toInstant();
        java.time.Instant end = periodEnd.plusDays(1).atStartOfDay(zone).toInstant();
        return leads.countByOriginBetween(start, end);
    }

    @Transactional(readOnly = true)
    public List<br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString> topServices(LocalDate from, LocalDate to) {
        LocalDate periodStart = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        validateRange(periodStart, periodEnd);
        return contracts.countTopServicesBetween(periodStart, periodEnd);
    }

    @Transactional(readOnly = true)
    public List<br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString> projectsStatus(LocalDate from, LocalDate to) {
        LocalDate periodStart = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        validateRange(periodStart, periodEnd);
        java.time.ZoneId zone = java.time.ZoneId.of("UTC");
        java.time.Instant start = periodStart.atStartOfDay(zone).toInstant();
        java.time.Instant end = periodEnd.plusDays(1).atStartOfDay(zone).toInstant();
        return projects.countByStatusBetween(start, end);
    }

    private Map<LocalDate, Long> toDateMap(List<Object[]> rows) {
        Map<LocalDate, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            Long count = ((Number) row[1]).longValue();
            map.put(date, count);
        }
        return map;
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("Data final do dashboard nao pode ser anterior a data inicial");
        }
    }
}
