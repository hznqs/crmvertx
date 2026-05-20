package br.com.vertxmidia.crm.modules.dashboard.web;

import br.com.vertxmidia.crm.modules.dashboard.application.DashboardChartService;
import br.com.vertxmidia.crm.modules.dashboard.application.DashboardService;
import br.com.vertxmidia.crm.modules.dashboard.dto.DashboardMetricsResponse;
import br.com.vertxmidia.crm.modules.dashboard.dto.MeetingsSalesChartPoint;
import br.com.vertxmidia.crm.modules.dashboard.dto.RevenueChartPoint;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;
    private final DashboardChartService chartService;

    public DashboardController(DashboardService service, DashboardChartService chartService) {
        this.service = service;
        this.chartService = chartService;
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    DashboardMetricsResponse metrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.metrics(from, to);
    }

    @GetMapping("/revenue-chart")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    List<RevenueChartPoint> revenueChart(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return chartService.revenueByDay(from, to);
    }

    @GetMapping("/meetings-chart")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    List<MeetingsSalesChartPoint> meetingsChart(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return chartService.meetingsSalesByDay(from, to);
    }
}
