package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CrmEventRepository extends JpaRepository<CrmEvent, UUID>, JpaSpecificationExecutor<CrmEvent> {
    long countByStatusAndDateBetweenAndActiveTrue(String status, LocalDate start, LocalDate end);

    long countByStatusAndDateAfterAndActiveTrue(String status, LocalDate date);

    long countByDateAfterAndActiveTrue(LocalDate date);

    @Query("""
            select count(e)
            from CrmEvent e
            where e.active = true
              and lower(e.status) <> 'cancelada'
              and lower(e.responsible) = lower(:responsible)
              and (:eventId is null or e.id <> :eventId)
              and e.date <= :endDate
              and coalesce(e.endDate, e.date) >= :startDate
              and (
                    e.allDay = true
                    or (
                        e.time is not null
                        and e.endTime is not null
                        and e.time < :endTime
                        and e.endTime > :startTime
                    )
              )
            """)
    long countConflictingEvents(UUID eventId, String responsible, LocalDate startDate, LocalDate endDate, LocalTime startTime, LocalTime endTime);

    @Query("""
            select count(e)
            from CrmEvent e
            where e.date >= :date
              and e.active = true
              and lower(e.status) <> 'executada'
            """)
    long countPendingFollowups(LocalDate date);

    @Query("""
            select e.date as eventDate, count(e) as total
            from CrmEvent e
            where e.status = :status
              and e.active = true
              and e.date between :start and :end
            group by e.date
            order by e.date
            """)
    List<Object[]> countByDayBetween(String status, LocalDate start, LocalDate end);

    @Query("""
            select e.date as eventDate, count(e) as total
            from CrmEvent e
            where e.sale = true
              and e.active = true
              and e.date between :start and :end
            group by e.date
            order by e.date
            """)
    List<Object[]> countSalesByDayBetween(LocalDate start, LocalDate end);
}
