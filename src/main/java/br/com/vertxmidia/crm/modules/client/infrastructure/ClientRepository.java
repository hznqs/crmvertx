package br.com.vertxmidia.crm.modules.client.infrastructure;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ClientRepository extends JpaRepository<Client, UUID>, JpaSpecificationExecutor<Client> {
    List<Client> findByPhase(ClientPhase phase, Sort sort);

    long countByPhase(ClientPhase phase);

    long countByStatusAndActiveTrue(ClientStatus status);

    long countByPriorityAndActiveTrue(ClientPriority priority);

    boolean existsByDocumentAndActiveTrue(String document);

    boolean existsByDocumentAndActiveTrueAndIdNot(String document, UUID id);

    Optional<Client> findByIdAndActiveTrue(UUID id);

    @Query("select coalesce(avg(c.contractValue), 0) from Client c where c.phase = :phase")
    BigDecimal averageTicketByPhase(ClientPhase phase);

    @Query("select coalesce(sum(c.contractValue), 0) from Client c where c.phase = :phase")
    BigDecimal sumContractValueByPhase(ClientPhase phase);

    @Query("select count(c) from Client c where c.createdAt >= :since")
    long countCreatedSince(Instant since);
}
