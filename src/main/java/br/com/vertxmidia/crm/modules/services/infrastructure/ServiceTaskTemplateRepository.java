package br.com.vertxmidia.crm.modules.services.infrastructure;

import br.com.vertxmidia.crm.modules.services.domain.ServiceTaskTemplate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceTaskTemplateRepository extends JpaRepository<ServiceTaskTemplate, UUID> {

    List<ServiceTaskTemplate> findByServiceIdAndActiveTrueOrderBySortOrderAsc(UUID serviceId);
}
