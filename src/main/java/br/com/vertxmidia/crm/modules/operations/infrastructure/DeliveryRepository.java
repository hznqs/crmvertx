package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.Delivery;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID>, JpaSpecificationExecutor<Delivery> {
    long countByDeadlineBeforeAndStatusNot(LocalDate date, String status);

    List<Delivery> findByProjectIdAndActiveTrue(UUID projectId);

    @Query("""
            select count(delivery)
            from Delivery delivery
            where delivery.status = :status
              and delivery.active = true
              and (:clientId is null or delivery.clientId = :clientId)
              and (:owner is null or :owner = '' or lower(delivery.owner) like concat('%', lower(:owner), '%'))
            """)
    long countByStatusAndFilters(String status, UUID clientId, String owner);

    @Query("""
            select count(delivery)
            from Delivery delivery
            where delivery.deadline < :date
              and delivery.active = true
              and delivery.status <> 'aprovado'
              and (:clientId is null or delivery.clientId = :clientId)
              and (:owner is null or :owner = '' or lower(delivery.owner) like concat('%', lower(:owner), '%'))
            """)
    long countLateByFilters(LocalDate date, UUID clientId, String owner);
}
