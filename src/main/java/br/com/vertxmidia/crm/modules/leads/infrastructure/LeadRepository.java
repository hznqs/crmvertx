package br.com.vertxmidia.crm.modules.leads.infrastructure;

import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.Lead;
import br.com.vertxmidia.crm.modules.leads.domain.LeadOrigin;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import br.com.vertxmidia.crm.modules.leads.domain.LeadTemperature;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface LeadRepository extends JpaRepository<Lead, UUID>, JpaSpecificationExecutor<Lead> {

    long countByActiveTrue();

    long countByStatus(LeadStatus status);

    long countByCommercialStage(CommercialStage commercialStage);

    long countByTemperatureAndActiveTrue(LeadTemperature temperature);

    long countByOriginAndActiveTrue(LeadOrigin origin);

    boolean existsByEmailIgnoreCaseAndActiveTrue(String email);

    boolean existsByEmailIgnoreCaseAndActiveTrueAndIdNot(String email, UUID id);

    Optional<Lead> findByIdAndActiveTrue(UUID id);

    @Query("select coalesce(sum(l.potentialValue), 0) from Lead l where l.active = true and l.status = :status")
    BigDecimal sumPotentialValueByStatus(LeadStatus status);

    @Query("select count(l) from Lead l where l.active = true and l.createdAt >= :since")
    long countActiveCreatedSince(Instant since);
}
