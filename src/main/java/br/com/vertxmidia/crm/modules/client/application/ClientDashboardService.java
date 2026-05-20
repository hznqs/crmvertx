package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientDashboard;
import br.com.vertxmidia.crm.modules.client.dto.ClientDashboardRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientDashboardResponse;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientDashboardRepository;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientDashboardService {

    private final ClientDashboardRepository repository;
    private final ClientRepository clientRepository;
    private final AuditService auditService;

    public ClientDashboardService(
            ClientDashboardRepository repository,
            ClientRepository clientRepository,
            AuditService auditService
    ) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public ClientDashboardResponse findByClientId(UUID clientId) {
        ensureClientExists(clientId);
        return repository.findByClientId(clientId)
                .map(ClientDashboardResponse::from)
                .orElseGet(() -> ClientDashboardResponse.empty(clientId));
    }

    @Transactional
    public ClientDashboardResponse save(UUID clientId, ClientDashboardRequest request) {
        ensureClientExists(clientId);
        ClientDashboard dashboard = repository.findByClientId(clientId).orElseGet(() -> {
            ClientDashboard created = new ClientDashboard();
            created.setClientId(clientId);
            return created;
        });

        auditDashboardChanges(dashboard, request);
        dashboard.setServices(blankToNull(request.services()));
        dashboard.setNextSteps(blankToNull(request.nextSteps()));
        dashboard.setHistory(blankToNull(request.history()));
        dashboard.setFiles(blankToNull(request.files()));

        ClientDashboard saved = repository.save(dashboard);
        auditService.log("UPDATE_CLIENT_DASHBOARD", "ClienteDashboard", saved.getId());
        return ClientDashboardResponse.from(saved);
    }

    private void ensureClientExists(UUID clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new EntityNotFoundException("Cliente nao encontrado");
        }
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void auditDashboardChanges(ClientDashboard dashboard, ClientDashboardRequest request) {
        UUID auditId = dashboard.getId() == null ? dashboard.getClientId() : dashboard.getId();
        auditService.logChange("ClienteDashboard", auditId, "services", dashboard.getServices(), blankToNull(request.services()));
        auditService.logChange("ClienteDashboard", auditId, "nextSteps", dashboard.getNextSteps(), blankToNull(request.nextSteps()));
        auditService.logChange("ClienteDashboard", auditId, "history", dashboard.getHistory(), blankToNull(request.history()));
        auditService.logChange("ClienteDashboard", auditId, "files", dashboard.getFiles(), blankToNull(request.files()));
    }
}
