package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CrmEventRepository extends JpaRepository<CrmEvent, UUID>, JpaSpecificationExecutor<CrmEvent> {
    long countByStatusAndDateBetween(String status, LocalDate start, LocalDate end);
}
