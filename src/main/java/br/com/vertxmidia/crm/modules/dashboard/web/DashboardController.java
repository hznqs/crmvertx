package br.com.vertxmidia.crm.modules.dashboard.web;

import br.com.vertxmidia.crm.modules.dashboard.application.DashboardService;
import br.com.vertxmidia.crm.modules.dashboard.dto.DashboardMetricsResponse;
import java.time.LocalDate;
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

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    DashboardMetricsResponse metrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.metrics(from, to);
    }
}
