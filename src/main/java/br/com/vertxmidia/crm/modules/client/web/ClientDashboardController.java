package br.com.vertxmidia.crm.modules.client.web;

import br.com.vertxmidia.crm.modules.client.application.ClientDashboardService;
import br.com.vertxmidia.crm.modules.client.dto.ClientDashboardRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientDashboardResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clients/{clientId}/dashboard")
public class ClientDashboardController {

    private final ClientDashboardService service;

    public ClientDashboardController(ClientDashboardService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','OPERACIONAL','FINANCEIRO')")
    ClientDashboardResponse findByClient(@PathVariable UUID clientId) {
        return service.findByClientId(clientId);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','OPERACIONAL')")
    ClientDashboardResponse save(@PathVariable UUID clientId, @Valid @RequestBody ClientDashboardRequest request) {
        return service.save(clientId, request);
    }
}
