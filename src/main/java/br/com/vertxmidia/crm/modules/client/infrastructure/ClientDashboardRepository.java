package br.com.vertxmidia.crm.modules.client.infrastructure;

import br.com.vertxmidia.crm.modules.client.domain.ClientDashboard;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientDashboardRepository extends JpaRepository<ClientDashboard, UUID> {
    Optional<ClientDashboard> findByClientId(UUID clientId);
}
