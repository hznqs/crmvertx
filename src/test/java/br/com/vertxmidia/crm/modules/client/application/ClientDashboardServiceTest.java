package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientDashboard;
import br.com.vertxmidia.crm.modules.client.dto.ClientDashboardRequest;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientDashboardRepository;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ClientDashboardServiceTest {

    @Test
    void saveCreatesWorkspaceWhenClientExists() {
        UUID clientId = UUID.randomUUID();
        ClientDashboardRepository dashboards = mock(ClientDashboardRepository.class);
        ClientRepository clients = mock(ClientRepository.class);
        AuditService audit = mock(AuditService.class);
        when(clients.existsById(clientId)).thenReturn(true);
        when(dashboards.findByClientId(clientId)).thenReturn(Optional.empty());
        when(dashboards.save(any(ClientDashboard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClientDashboardService service = new ClientDashboardService(dashboards, clients, audit);

        var response = service.save(clientId, new ClientDashboardRequest(" Social ", " Aprovar ", " Ligacao ", " Drive "));

        assertThat(response.clientId()).isEqualTo(clientId);
        assertThat(response.services()).isEqualTo("Social");
        assertThat(response.nextSteps()).isEqualTo("Aprovar");
        assertThat(response.history()).isEqualTo("Ligacao");
        assertThat(response.files()).isEqualTo("Drive");
        verify(audit).log("UPDATE_CLIENT_DASHBOARD", "ClienteDashboard", response.id());
    }

    @Test
    void findByClientRejectsUnknownClient() {
        UUID clientId = UUID.randomUUID();
        ClientDashboardService service = new ClientDashboardService(
                mock(ClientDashboardRepository.class),
                mock(ClientRepository.class),
                mock(AuditService.class)
        );

        assertThatThrownBy(() -> service.findByClientId(clientId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Cliente nao encontrado");
    }
}
