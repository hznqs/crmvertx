package br.com.vertxmidia.crm.modules.services.infrastructure;

import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, UUID>, JpaSpecificationExecutor<ServiceOffering> {

    Optional<ServiceOffering> findByIdAndActiveTrue(UUID id);

    boolean existsByNameIgnoreCaseAndActiveTrue(String name);

    boolean existsByNameIgnoreCaseAndActiveTrueAndIdNot(String name, UUID id);
}
