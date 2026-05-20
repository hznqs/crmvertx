package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.Delivery;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID>, JpaSpecificationExecutor<Delivery> {
    long countByDeadlineBeforeAndStatusNot(LocalDate date, String status);
}
