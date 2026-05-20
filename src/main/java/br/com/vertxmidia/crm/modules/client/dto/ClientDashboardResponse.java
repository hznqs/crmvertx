package br.com.vertxmidia.crm.modules.client.dto;

import br.com.vertxmidia.crm.modules.client.domain.ClientDashboard;
import java.time.Instant;
import java.util.UUID;

public record ClientDashboardResponse(
        UUID id,
        UUID clientId,
        String services,
        String nextSteps,
        String history,
        String files,
        Instant updatedAt
) {
    public static ClientDashboardResponse empty(UUID clientId) {
        return new ClientDashboardResponse(null, clientId, "", "", "", "", null);
    }

    public static ClientDashboardResponse from(ClientDashboard dashboard) {
        return new ClientDashboardResponse(
                dashboard.getId(),
                dashboard.getClientId(),
                dashboard.getServices(),
                dashboard.getNextSteps(),
                dashboard.getHistory(),
                dashboard.getFiles(),
                dashboard.getUpdatedAt()
        );
    }
}
