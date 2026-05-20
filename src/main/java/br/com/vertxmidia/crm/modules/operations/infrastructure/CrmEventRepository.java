package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CrmEventRepository extends JpaRepository<CrmEvent, UUID>, JpaSpecificationExecutor<CrmEvent> {
    long countByStatusAndDateBetween(String status, LocalDate start, LocalDate end);

    long countByStatusAndDateAfter(String status, LocalDate date);

    long countByDateAfter(LocalDate date);

    @Query("""
            select count(e)
            from CrmEvent e
            where e.date >= :date
              and lower(e.status) <> 'executada'
            """)
    long countPendingFollowups(LocalDate date);

    @Query("""
            select e.date as eventDate, count(e) as total
            from CrmEvent e
            where e.status = :status
              and e.date between :start and :end
            group by e.date
            order by e.date
            """)
    List<Object[]> countByDayBetween(String status, LocalDate start, LocalDate end);

    @Query("""
            select e.date as eventDate, count(e) as total
            from CrmEvent e
            where e.sale = true
              and e.date between :start and :end
            group by e.date
            order by e.date
            """)
    List<Object[]> countSalesByDayBetween(LocalDate start, LocalDate end);
}
