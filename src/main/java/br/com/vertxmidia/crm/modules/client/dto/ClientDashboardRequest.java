package br.com.vertxmidia.crm.modules.client.dto;

import jakarta.validation.constraints.Size;

public record ClientDashboardRequest(
        @Size(max = 20000) String services,
        @Size(max = 20000) String nextSteps,
        @Size(max = 40000) String history,
        @Size(max = 20000) String files
) {
}
