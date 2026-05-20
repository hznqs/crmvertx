package br.com.vertxmidia.crm.modules.client.infrastructure;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ClientRepository extends JpaRepository<Client, UUID>, JpaSpecificationExecutor<Client> {
    long countByPhase(ClientPhase phase);

    @Query("select coalesce(avg(c.contractValue), 0) from Client c where c.phase = :phase")
    BigDecimal averageTicketByPhase(ClientPhase phase);
}
